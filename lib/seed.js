const SEED_ITEMS = [
  {
    id: 'sample-lost-iphone-delhi', reportId: 'TR-L-1042', type: 'lost', name: 'Midnight iPhone 13', category: 'Mobile Phones',
    description: 'Black iPhone 13 with a small crack near the top-right corner and a clear case. The lock screen has a mountain wallpaper.',
    brand: 'Apple', color: 'Black', marks: 'Small crack at top-right; mountain wallpaper', date: '2026-11-17', time: '18:30',
    state: 'Delhi', city: 'New Delhi', location: 'Near Gate 3, India Gate', additionalInfo: 'Last seen after an evening walk.', secured: false,
  },
  {
    id: 'sample-found-iphone-delhi', reportId: 'TR-F-1049', type: 'found', name: 'Black Apple smartphone', category: 'Mobile Phones',
    description: 'Found a black Apple phone with a cracked top-right screen corner inside a transparent case near India Gate. Mountain wallpaper visible.',
    brand: 'Apple', color: 'Black', marks: 'Crack in upper right corner; transparent case', date: '2026-11-18', time: '09:10',
    state: 'Delhi', city: 'New Delhi', location: 'India Gate, close to Gate 3', additionalInfo: 'Handed in to the nearby help desk.', secured: true,
  },
  {
    id: 'sample-lost-wallet-mumbai', reportId: 'TR-L-1038', type: 'lost', name: 'Brown leather wallet', category: 'Wallets & Purses',
    description: 'Slim brown leather wallet with initials A.K. embossed inside. Contains a metro card and a family photograph.',
    brand: 'Hidesign', color: 'Brown', marks: 'A.K. initials embossed inside', date: '2026-11-14', time: '13:15',
    state: 'Maharashtra', city: 'Mumbai', location: 'Bandra West, near Linking Road', additionalInfo: 'Please keep the cards safe; the photo is important.', secured: false,
  },
  {
    id: 'sample-found-wallet-mumbai', reportId: 'TR-F-1051', type: 'found', name: 'Leather wallet with initials', category: 'Wallets & Purses',
    description: 'A brown leather wallet found near Linking Road in Bandra. The inside has A.K. initials and a small family photo.',
    brand: 'Hidesign', color: 'Tan brown', marks: 'A.K. engraved; family photograph inside', date: '2026-11-15', time: '11:40',
    state: 'Maharashtra', city: 'Mumbai', location: 'Linking Road, Bandra West', additionalInfo: 'Secured at the shop reception.', secured: true,
  },
  {
    id: 'sample-lost-laptop-bengaluru', reportId: 'TR-L-1033', type: 'lost', name: 'Dell XPS 13 laptop', category: 'Laptops & Electronics',
    description: 'Silver Dell XPS 13 in a grey sleeve. A small red telescope sticker is on the lid beside the Dell logo.',
    brand: 'Dell', color: 'Silver', marks: 'Red telescope sticker on lid', date: '2026-11-11', time: '20:00',
    state: 'Karnataka', city: 'Bengaluru', location: 'Indiranagar Metro Station', additionalInfo: 'The laptop is protected with a password.', secured: false,
  },
  {
    id: 'sample-found-laptop-bengaluru', reportId: 'TR-F-1045', type: 'found', name: 'Silver Dell laptop in sleeve', category: 'Laptops & Electronics',
    description: 'Found a silver Dell XPS laptop inside a grey sleeve at Indiranagar Metro. There is a little red telescope sticker on the lid.',
    brand: 'Dell', color: 'Silver', marks: 'Red telescope sticker near Dell logo', date: '2026-11-12', time: '08:25',
    state: 'Karnataka', city: 'Bengaluru', location: 'Indiranagar Metro Station, Bengaluru', additionalInfo: 'Left safely with station security.', secured: true,
  },
  {
    id: 'sample-lost-backpack-mumbai', reportId: 'TR-L-1026', type: 'lost', name: 'Navy blue Wildcraft backpack', category: 'Bags & Luggage',
    description: 'Navy blue Wildcraft backpack with a yellow keychain on the front zip. A sketchbook and water bottle are inside.',
    brand: 'Wildcraft', color: 'Navy blue', marks: 'Yellow keychain on front zipper', date: '2026-11-09', time: '16:45',
    state: 'Maharashtra', city: 'Mumbai', location: 'Chhatrapati Shivaji Maharaj Terminus', additionalInfo: 'The outer front pocket has a small tear.', secured: false,
  },
  {
    id: 'sample-found-backpack-mumbai', reportId: 'TR-F-1041', type: 'found', name: 'Blue backpack with yellow keyring', category: 'Bags & Luggage',
    description: 'A navy Wildcraft bag left on the local train at CSMT. It has a yellow keyring at the front zip and a small pocket tear.',
    brand: 'Wildcraft', color: 'Navy', marks: 'Yellow keychain; torn front pocket', date: '2026-11-10', time: '07:55',
    state: 'Maharashtra', city: 'Mumbai', location: 'CSMT station, Mumbai', additionalInfo: 'Kept with the railway lost property counter.', secured: true,
  },
  {
    id: 'sample-lost-documents-lucknow', reportId: 'TR-L-1019', type: 'lost', name: 'Blue document folder', category: 'Documents',
    description: 'A blue plastic folder with university certificates and a marked brown envelope inside. Name Riya Sharma is on the first page.',
    brand: '', color: 'Blue', marks: 'Riya Sharma written on first page', date: '2026-11-06', time: '12:20',
    state: 'Uttar Pradesh', city: 'Lucknow', location: 'Hazratganj, near the public library', additionalInfo: 'No cash or bank information is inside.', secured: false,
  },
  {
    id: 'sample-found-documents-lucknow', reportId: 'TR-F-1037', type: 'found', name: 'Blue folder of certificates', category: 'Documents',
    description: 'Found a blue plastic folder with university certificates and a brown envelope in Hazratganj. The name Riya Sharma appears on the top sheet.',
    brand: '', color: 'Blue', marks: 'Riya Sharma on a certificate', date: '2026-11-07', time: '10:05',
    state: 'Uttar Pradesh', city: 'Lucknow', location: 'Hazratganj public library, Lucknow', additionalInfo: 'Handed to the library information desk.', secured: true,
  },
  {
    id: 'sample-lost-watch-jaipur', reportId: 'TR-L-1021', type: 'lost', name: 'Black Casio digital watch', category: 'Other',
    description: 'Black Casio digital wristwatch with a scratched face and a narrow strap. The alarm is set for 6:30 in the morning.',
    brand: 'Casio', color: 'Black', marks: 'Scratch across watch face', date: '2026-11-05', time: '07:30',
    state: 'Rajasthan', city: 'Jaipur', location: 'Hawa Mahal, east entrance', additionalInfo: 'It was a graduation gift.', secured: false,
  },
  {
    id: 'sample-found-watch-jaipur', reportId: 'TR-F-1032', type: 'found', name: 'Casio black digital watch', category: 'Other',
    description: 'Picked up a black Casio wristwatch by the Hawa Mahal east gate. The glass has a visible scratch and the strap is quite narrow.',
    brand: 'Casio', color: 'Black', marks: 'Scratched glass; 6:30 alarm', date: '2026-11-06', time: '08:00',
    state: 'Rajasthan', city: 'Jaipur', location: 'Hawa Mahal east entrance, Jaipur', additionalInfo: 'Safe with the nearby visitor assistance counter.', secured: true,
  },
  {
    id: 'sample-lost-id-chandigarh', reportId: 'TR-L-1017', type: 'lost', name: 'Punjab university ID card', category: 'Identity Cards',
    description: 'Student identity card in a clear sleeve with a blue lanyard. The card belongs to Amanpreet Singh.',
    brand: 'Panjab University', color: 'Blue and white', marks: 'Blue lanyard; Amanpreet Singh', date: '2026-11-04', time: '14:10',
    state: 'Chandigarh', city: 'Chandigarh', location: 'Sector 17 bus stand', additionalInfo: 'Please do not share card details publicly.', secured: false,
  },
  {
    id: 'sample-found-id-chandigarh', reportId: 'TR-F-1029', type: 'found', name: 'Student ID card with blue lanyard', category: 'Identity Cards',
    description: 'Found a Panjab University student card in a transparent sleeve attached to a blue lanyard at Sector 17 bus stand.',
    brand: 'Panjab University', color: 'Blue and white', marks: 'Amanpreet Singh printed on card', date: '2026-11-05', time: '09:35',
    state: 'Chandigarh', city: 'Chandigarh', location: 'Sector 17 ISBT, Chandigarh', additionalInfo: 'Secured with the bus stand help desk. Details hidden for safety.', secured: true,
  },
  {
    id: 'sample-lost-earbuds-hyderabad', reportId: 'TR-L-1008', type: 'lost', name: 'White wireless earbuds', category: 'Laptops & Electronics',
    description: 'White Samsung Galaxy Buds in a matte white charging case. There is a tiny blue dot drawn on the underside.',
    brand: 'Samsung', color: 'White', marks: 'Small blue dot underneath case', date: '2026-11-02', time: '19:10',
    state: 'Telangana', city: 'Hyderabad', location: 'Hitec City Metro, platform 2', additionalInfo: 'The left earbud has a small scuff.', secured: false,
  },
  {
    id: 'sample-found-earbuds-hyderabad', reportId: 'TR-F-1020', type: 'found', name: 'Samsung earbuds in white case', category: 'Laptops & Electronics',
    description: 'A white Samsung Galaxy Buds case with both earbuds was found at Hitec City Metro platform two. Small blue mark underneath.',
    brand: 'Samsung', color: 'White', marks: 'Blue dot under charging case; left bud scuffed', date: '2026-11-03', time: '07:50',
    state: 'Telangana', city: 'Hyderabad', location: 'Hitec City Metro Station, Hyderabad', additionalInfo: 'Given to metro station staff.', secured: true,
  },
  {
    id: 'sample-lost-bracelet-chennai', reportId: 'TR-L-1002', type: 'lost', name: 'Gold bracelet with tiny star', category: 'Jewellery',
    description: 'A fine gold bracelet with a small star charm and a loose clasp. It was inside a red velvet pouch earlier in the day.',
    brand: '', color: 'Gold', marks: 'Small star charm; loose clasp', date: '2026-10-31', time: '17:00',
    state: 'Tamil Nadu', city: 'Chennai', location: 'Marina Beach, near the lighthouse', additionalInfo: 'Sentimental value; please contact through TraceIt.', secured: false,
  },
  {
    id: 'sample-found-bracelet-chennai', reportId: 'TR-F-1013', type: 'found', name: 'Gold bracelet with star charm', category: 'Jewellery',
    description: 'Found a delicate gold chain bracelet by Marina Beach lighthouse. It has a small star charm and clasp that does not close tightly.',
    brand: '', color: 'Gold', marks: 'Star charm; loose fastening clasp', date: '2026-11-01', time: '08:20',
    state: 'Tamil Nadu', city: 'Chennai', location: 'Marina Beach lighthouse, Chennai', additionalInfo: 'Stored safely at the beach patrol kiosk.', secured: true,
  },
  {
    id: 'sample-lost-keys-pune', reportId: 'TR-L-0994', type: 'lost', name: 'Three keys on a blue tag', category: 'Keys',
    description: 'Three silver house keys with a rectangular blue plastic tag and a small brass bicycle charm.',
    brand: '', color: 'Silver and blue', marks: 'Blue tag and brass bicycle charm', date: '2026-10-28', time: '10:35',
    state: 'Maharashtra', city: 'Pune', location: 'Shaniwar Wada entrance', additionalInfo: 'The tag has no address or personal details.', secured: false,
  },
  {
    id: 'sample-found-keys-pune', reportId: 'TR-F-1004', type: 'found', name: 'Keys with bicycle charm', category: 'Keys',
    description: 'A ring of three silver keys found outside Shaniwar Wada. Attached is a blue plastic tag and a tiny brass bicycle charm.',
    brand: '', color: 'Silver', marks: 'Three keys; blue tag; brass bicycle', date: '2026-10-29', time: '09:00',
    state: 'Maharashtra', city: 'Pune', location: 'Shaniwar Wada main entrance, Pune', additionalInfo: 'Held by the visitor information desk.', secured: true,
  },
  {
    id: 'sample-lost-id-ludhiana', reportId: 'TR-L-0975', type: 'lost', name: 'College identity card with green lanyard', category: 'Identity Cards',
    description: 'A student identity card in a clear sleeve attached to a green lanyard. The card belongs to Simran Kaur and has a small sunflower sticker on the back.',
    brand: 'Punjab Agricultural University', color: 'Green and white', marks: 'Green lanyard; sunflower sticker on the back', date: '2026-10-24', time: '15:25',
    state: 'Punjab', city: 'Ludhiana', location: 'PAU main library entrance', additionalInfo: 'Please do not post the card number publicly.', secured: false,
  },
  {
    id: 'sample-found-id-ludhiana', reportId: 'TR-F-0982', type: 'found', name: 'PAU student ID in clear sleeve', category: 'Identity Cards',
    description: 'Found a Punjab Agricultural University student card in a clear sleeve with a green lanyard near the main library. A sunflower sticker is on the reverse.',
    brand: 'Punjab Agricultural University', color: 'Green and white', marks: 'Green lanyard; sunflower sticker on reverse', date: '2026-10-25', time: '08:40',
    state: 'Punjab', city: 'Ludhiana', location: 'Punjab Agricultural University library, Ludhiana', additionalInfo: 'Left with the university security office. Card number kept private.', secured: true,
  },
  {
    id: 'sample-found-passport-amritsar', reportId: 'TR-F-0988', type: 'found', name: 'Passport pouch', category: 'Documents',
    description: 'A maroon zip passport pouch left at the airport cafe. The passport name is kept private for verification.',
    brand: '', color: 'Maroon', marks: 'Maroon zip pouch', date: '2026-10-26', time: '16:15',
    state: 'Punjab', city: 'Amritsar', location: 'Sri Guru Ram Dass Jee International Airport', additionalInfo: 'Submitted to airport lost property.', secured: true,
  },
];

function attachOwner(userId) {
  return SEED_ITEMS.map((item, index) => ({
    ...item,
    userId,
    image: '',
    isDemo: true,
    status: 'active',
    createdAt: new Date(Date.UTC(2026, 10, 19 - index, 12, 0, 0)).toISOString(),
  }));
}

export function getSeedItems(userId = 'demo-user') {
  return attachOwner(userId);
}

export const SAMPLE_ITEMS = attachOwner('demo-user');
