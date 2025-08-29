# VNVNC Website Updates - Complete Requirements Document

## 1. RESERVATIONS PAGE UPDATES ✅ (COMPLETED)

### Table Structure Changes ✅
- **Стол на 3 человека (№3, 7, 6)**
  - Депозит: 10,500 ₽
  - Предоплата: 1,000 ₽

- **Стол на 4-5 человек (№1, 2, 4, 5, 8, 9)**
  - Депозит: от 14,000 ₽
  - Предоплата: 2,000 ₽

- **VIP ложа (№10)**
  - 10-14 человек
  - Эксклюзивная зона
  - Персональный официант
  - Лучший вид
  - Премиум сервис
  - Депозит: от 35,000 ₽
  - Предоплата: 5,000 ₽

### Important Changes ✅
- Changed "vip" to "VIP" (all capital letters)
- Changed labels to clearly show "Предоплата" vs "Депозит"
- Added table numbers to each category

### FAQ Update ✅
- Added to "Что входит в депозит?": "Welcome set стоимостью 1000 ₽ уже включен в депозит."

### Working Hours (KEEP AS IS) ✅
- Keep: "Пт-Вс: 23:00-06:00" (not changing to longer format)

### Still TODO
- Add table layout scheme showing positions of tables in VIP zone

---

## 2. CLUB RENTAL PAGE (NEW PAGE NEEDED)

### Navigation
- Add "аренда" to navigation menu (between "бронирование" and "контакты")
- Add "Аренда клуба" to footer quick links
- Route: `/rental`

### Page Content Structure

#### Header
```
Аренда клуба
Проведите мероприятие в одном из лучших клубов Санкт-Петербурга
```

#### Contact Information
```
Для того, чтобы узнать условия аренды, позвоните по номеру:
+7 (921) 410-44-40
[Make phone number clickable - tel:+79214104440]
```

#### Tech Rider Section (Format Beautifully)
```
TECH RIDER VNVNC

P.A. System
• Top: Martin F12 x2
• Sub: Martin WLX x2

AMP RACK
• Processing: Xilica XP3060 x1
• POWERSOFT Q3204 x1

DJ
• Pioneer CDJ 900 x2
• Pioneer DJM 700 x1
• Behringer XR-12 x1

LIGHT
• Led Par x4
• Beam Bar RGBW x2
• MA2 on PC x1

Production Manager
Спиридонов Михаил
vnvnctech@gmail.com
+79643853763
```

#### Contact Form (SIMPLIFIED)
Only 2 fields:
1. **Имя** (required)
2. **Телефон** (required)

Button: "Отправить заявку"

### Form Submission
- Form should send data to Telegram bot (same as booking form)
- Same recipients as booking/contact forms
- Format message as:
```
🏢 Новая заявка на аренду клуба!

👤 Имя: [name]
📱 Телефон: [phone]

#rental #vnvnc
```

---

## 3. IMPROVED RULES TEXT

Replace current rules text with:

```
Важно помнить:

VNVNC — это про взаимное уважение и крутую атмосферу. Мы строим это место вместе с тобой, и каждый вечер здесь — это история, которую мы создаём. Администрация заботится о безопасности и комфорте всех гостей, поэтому оставляет за собой право принимать решения о допуске в клуб. Если что-то пошло не так — не переживай, бывает. Главное — мы все здесь для того, чтобы классно провести время, танцевать под отличную музыку и чувствовать себя свободно. Соблюдение правил — это твой вклад в атмосферу VNVNC. Спасибо, что ты с нами! 🖤
```

---

## 4. TELEGRAM BOT INTEGRATION

### New Bot Token
- Token: `7102934750:AAHBBKjZiXD1gSxQjTtraz9h1BzxQrJZUP0`
- Update in Cloudflare Worker environment variables

### Recipients (Keep Same)
- Booking Manager ID: `429156227`
- Admin ID: `433491`
- Admin Email: `Seregamarkin1@gmail.com`

### API Endpoints
- `/booking` - for table reservations (existing)
- `/contact` - for contact form (existing)
- `/rental` - for club rental (NEW - needs to be added)

---

## 5. IMPLEMENTATION CHECKLIST

### Completed ✅
- [x] Updated table structure and pricing in ReservationsPage
- [x] Updated FAQ with Welcome set info
- [x] Changed "vip" to "VIP" throughout
- [x] Added table numbers to categories
- [x] Updated Cloudflare Worker for new table types
- [x] Created basic RentalPage component
- [x] Added rental route to App.tsx
- [x] Added rental to Navigation menu
- [x] Added rental to Footer links

### Still TODO
- [ ] Complete RentalPage with tech rider content
- [ ] Add rental form to RentalPage
- [ ] Create table layout scheme for ReservationsPage
- [ ] Add submitRental function to api.ts
- [ ] Add /rental endpoint to Cloudflare Worker
- [ ] Update Rules page with improved text
- [ ] Test all forms and Telegram bot integration
- [ ] Update Telegram bot token in Cloudflare Worker settings

---

## 6. DESIGN REQUIREMENTS

### Styling Guidelines
- Use existing neon aesthetic (red: #ff0040)
- Glass effects with backdrop-blur
- Border radius: 12px (default for buttons/cards)
- Mobile responsive
- Use existing UI components (Button, NeonText, etc.)

### Tech Rider Display
- Format as professional tech spec sheet
- Use monospace font for equipment lists
- Clear sections with headers
- Contact info prominently displayed

### Form Design
- Keep consistent with existing forms
- Glass background
- Red accent on focus
- Clear validation states
- Mobile-friendly

---

## 7. DEPLOYMENT NOTES

### Cloudflare Worker
- Update environment variable: `TELEGRAM_BOT_TOKEN`
- Deploy new version with /rental endpoint
- Test all three endpoints (/booking, /contact, /rental)

### Testing
1. Test reservation form with new table types
2. Test rental form submission
3. Verify Telegram messages arrive correctly
4. Check mobile responsiveness
5. Validate all navigation links work

---

## EXACT TEXT TO USE (COPY THESE EXACTLY)

### For Rental Page Title
```
аренда клуба
```

### For Rental Page Subtitle
```
проведите мероприятие в одном из лучших клубов санкт-петербурга
```

### For Contact CTA
```
Для того, чтобы узнать условия аренды, позвоните по номеру:
```

### For Form Button
```
Отправить заявку
```

### For Success Message
```
Спасибо! Мы свяжемся с вами в ближайшее время для обсуждения деталей аренды.
```