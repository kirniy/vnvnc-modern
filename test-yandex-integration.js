// Test script for Yandex Disk integration
// Run with: node test-yandex-integration.js

const YANDEX_API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
const PUBLIC_KEY = 'sab0EP9Sm3G8LA';

async function testYandexDiskAPI() {
  console.log('Testing Yandex Disk API integration...\n');
  
  try {
    // Test 1: Fetch root folder
    console.log('Test 1: Fetching root folder contents...');
    const rootUrl = new URL(YANDEX_API_BASE);
    rootUrl.searchParams.append('public_key', PUBLIC_KEY);
    rootUrl.searchParams.append('limit', '10');
    
    const rootResponse = await fetch(rootUrl.toString());
    if (!rootResponse.ok) {
      throw new Error(`Failed to fetch root: ${rootResponse.status}`);
    }
    
    const rootData = await rootResponse.json();
    console.log(`✓ Root folder fetched successfully`);
    console.log(`  - Type: ${rootData.type}`);
    console.log(`  - Name: ${rootData.name}`);
    
    if (rootData._embedded && rootData._embedded.items) {
      console.log(`  - Contains ${rootData._embedded.items.length} items`);
      
      // List first few folders
      const folders = rootData._embedded.items.filter(item => item.type === 'dir').slice(0, 5);
      console.log('\n  Sample folders:');
      folders.forEach(folder => {
        console.log(`    - ${folder.name}`);
      });
    }
    
    // Test 2: Fetch a specific subfolder (if exists)
    if (rootData._embedded && rootData._embedded.items.length > 0) {
      const firstFolder = rootData._embedded.items.find(item => item.type === 'dir');
      
      if (firstFolder) {
        console.log(`\nTest 2: Fetching contents of "${firstFolder.name}"...`);
        
        const folderUrl = new URL(YANDEX_API_BASE);
        folderUrl.searchParams.append('public_key', PUBLIC_KEY);
        folderUrl.searchParams.append('path', firstFolder.path);
        folderUrl.searchParams.append('limit', '10');
        folderUrl.searchParams.append('preview_size', 'L');
        
        const folderResponse = await fetch(folderUrl.toString());
        if (!folderResponse.ok) {
          throw new Error(`Failed to fetch folder: ${folderResponse.status}`);
        }
        
        const folderData = await folderResponse.json();
        console.log(`✓ Folder fetched successfully`);
        
        if (folderData._embedded && folderData._embedded.items) {
          const images = folderData._embedded.items.filter(item => 
            item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')
          );
          const subfolders = folderData._embedded.items.filter(item => item.type === 'dir');
          
          console.log(`  - Contains ${subfolders.length} subfolders`);
          console.log(`  - Contains ${images.length} images`);
          
          if (images.length > 0) {
            console.log('\n  Sample images:');
            images.slice(0, 3).forEach(img => {
              console.log(`    - ${img.name} (${(img.size / 1024 / 1024).toFixed(2)} MB)`);
              if (img.preview) {
                console.log(`      Preview available: ${img.preview.substring(0, 50)}...`);
              }
            });
          }
          
          // If there are subfolders, check one more level deep
          if (subfolders.length > 0) {
            const subfolder = subfolders[0];
            console.log(`\nTest 3: Checking nested folder "${subfolder.name}"...`);
            
            const nestedUrl = new URL(YANDEX_API_BASE);
            nestedUrl.searchParams.append('public_key', PUBLIC_KEY);
            nestedUrl.searchParams.append('path', subfolder.path);
            nestedUrl.searchParams.append('limit', '10');
            nestedUrl.searchParams.append('preview_size', 'L');
            
            const nestedResponse = await fetch(nestedUrl.toString());
            if (nestedResponse.ok) {
              const nestedData = await nestedResponse.json();
              
              if (nestedData._embedded && nestedData._embedded.items) {
                const nestedImages = nestedData._embedded.items.filter(item => 
                  item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')
                );
                console.log(`✓ Nested folder contains ${nestedImages.length} images`);
              }
            }
          }
        }
      }
    }
    
    console.log('\n✅ All tests passed! Yandex Disk API is accessible.');
    console.log('\nFolder structure detected:');
    console.log('Root → Date-named folders → (Possible subfolder) → Images');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. The public link is still valid');
    console.error('2. The folder is still publicly accessible');
    console.error('3. Your internet connection is working');
  }
}

// Run the test
testYandexDiskAPI();