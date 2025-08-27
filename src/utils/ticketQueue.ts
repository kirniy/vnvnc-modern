/**
 * Ticket Queue System for handling high-traffic ticket purchases
 * 
 * Features:
 * - Virtual queue with position tracking
 * - Rate limiting to prevent server overload
 * - Automatic retry with exponential backoff
 * - Session preservation during queue wait
 * - Real-time position updates
 */

interface QueueEntry {
  id: string
  timestamp: number
  eventId: string
  ticketCount: number
  status: 'waiting' | 'processing' | 'completed' | 'failed'
  retryCount: number
  callback?: (success: boolean, data?: any) => void
}

class TicketQueueSystem {
  private queue: QueueEntry[] = []
  private processing = false
  private readonly MAX_CONCURRENT = 3 // Max concurrent ticket purchases
  private readonly RETRY_LIMIT = 3
  private readonly RATE_LIMIT_MS = 1000 // Minimum time between requests
  private lastRequestTime = 0
  private activeRequests = 0
  private queuePositionCallbacks = new Map<string, (position: number) => void>()

  /**
   * Add a ticket purchase to the queue
   */
  async addToQueue(
    eventId: string, 
    ticketCount: number,
    onPositionUpdate?: (position: number) => void
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return new Promise((resolve) => {
      const entry: QueueEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        eventId,
        ticketCount,
        status: 'waiting',
        retryCount: 0,
        callback: (success, data) => {
          if (onPositionUpdate) {
            this.queuePositionCallbacks.delete(entry.id)
          }
          resolve({ success, data })
        }
      }

      this.queue.push(entry)
      
      if (onPositionUpdate) {
        this.queuePositionCallbacks.set(entry.id, onPositionUpdate)
        onPositionUpdate(this.getQueuePosition(entry.id))
      }

      console.log(`Added to queue: Position ${this.queue.length}`)
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  /**
   * Get current position in queue
   */
  getQueuePosition(entryId: string): number {
    const index = this.queue.findIndex(e => e.id === entryId && e.status === 'waiting')
    return index === -1 ? 0 : index + 1
  }

  /**
   * Process the queue with rate limiting
   */
  private async processQueue() {
    if (this.processing || this.activeRequests >= this.MAX_CONCURRENT) {
      return
    }

    this.processing = true

    while (this.queue.length > 0 && this.activeRequests < this.MAX_CONCURRENT) {
      const entry = this.queue.find(e => e.status === 'waiting')
      
      if (!entry) {
        break
      }

      // Rate limiting
      const timeSinceLastRequest = Date.now() - this.lastRequestTime
      if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
        await this.sleep(this.RATE_LIMIT_MS - timeSinceLastRequest)
      }

      // Update queue positions
      this.updateQueuePositions()

      // Process the entry
      entry.status = 'processing'
      this.activeRequests++
      this.lastRequestTime = Date.now()

      // Process in background (don't await)
      this.processPurchase(entry).finally(() => {
        this.activeRequests--
        // Continue processing queue
        if (this.queue.some(e => e.status === 'waiting')) {
          this.processQueue()
        }
      })
    }

    this.processing = false
  }

  /**
   * Process a single ticket purchase with retry logic
   */
  private async processPurchase(entry: QueueEntry) {
    try {
      console.log(`Processing purchase for event ${entry.eventId}`)
      
      // Make the actual API call (this would be your ticket purchase endpoint)
      const response = await this.makeTicketPurchaseRequest(entry.eventId, entry.ticketCount)
      
      if (response.success) {
        entry.status = 'completed'
        this.removeFromQueue(entry.id)
        
        if (entry.callback) {
          entry.callback(true, response.data)
        }
      } else {
        throw new Error(response.error || 'Purchase failed')
      }
    } catch (error) {
      console.error(`Purchase failed for ${entry.eventId}:`, error)
      
      // Retry logic
      if (entry.retryCount < this.RETRY_LIMIT) {
        entry.retryCount++
        entry.status = 'waiting'
        
        // Exponential backoff
        const backoffMs = Math.min(1000 * Math.pow(2, entry.retryCount), 30000)
        console.log(`Retrying in ${backoffMs}ms (attempt ${entry.retryCount}/${this.RETRY_LIMIT})`)
        
        await this.sleep(backoffMs)
        
        // Re-add to queue for retry
        if (this.queue.find(e => e.id === entry.id)) {
          this.processQueue()
        }
      } else {
        // Max retries exceeded
        entry.status = 'failed'
        this.removeFromQueue(entry.id)
        
        if (entry.callback) {
          entry.callback(false, { error: 'Max retries exceeded' })
        }
      }
    }
  }

  /**
   * Make the actual ticket purchase request
   */
  private async makeTicketPurchaseRequest(eventId: string, ticketCount: number): Promise<any> {
    // This would be your actual API call to purchase tickets
    // For now, simulate with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            data: {
              eventId,
              ticketCount,
              confirmationNumber: `VNVNC-${Date.now()}`,
              purchaseTime: new Date().toISOString()
            }
          })
        } else {
          resolve({
            success: false,
            error: 'Tickets unavailable'
          })
        }
      }, 1000 + Math.random() * 1000) // Simulate 1-2 second API call
    })
  }

  /**
   * Update queue positions for all waiting entries
   */
  private updateQueuePositions() {
    this.queue
      .filter(e => e.status === 'waiting')
      .forEach((entry, index) => {
        const callback = this.queuePositionCallbacks.get(entry.id)
        if (callback) {
          callback(index + 1)
        }
      })
  }

  /**
   * Remove entry from queue
   */
  private removeFromQueue(entryId: string) {
    const index = this.queue.findIndex(e => e.id === entryId)
    if (index !== -1) {
      this.queue.splice(index, 1)
      this.queuePositionCallbacks.delete(entryId)
    }
  }

  /**
   * Helper sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    return {
      total: this.queue.length,
      waiting: this.queue.filter(e => e.status === 'waiting').length,
      processing: this.queue.filter(e => e.status === 'processing').length,
      completed: this.queue.filter(e => e.status === 'completed').length,
      failed: this.queue.filter(e => e.status === 'failed').length,
      activeRequests: this.activeRequests
    }
  }

  /**
   * Clear completed and failed entries from queue
   */
  clearCompleted() {
    this.queue = this.queue.filter(e => 
      e.status !== 'completed' && e.status !== 'failed'
    )
  }
}

// Export singleton instance
export const ticketQueue = new TicketQueueSystem()

// Export hook for React components
export function useTicketQueue() {
  const purchaseTickets = async (
    eventId: string, 
    ticketCount: number,
    onPositionUpdate?: (position: number) => void
  ) => {
    return ticketQueue.addToQueue(eventId, ticketCount, onPositionUpdate)
  }

  const getStats = () => ticketQueue.getQueueStats()

  return {
    purchaseTickets,
    getStats,
    clearCompleted: () => ticketQueue.clearCompleted()
  }
}

export default ticketQueue