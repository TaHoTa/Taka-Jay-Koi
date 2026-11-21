// All text, default categories, presets and themes.

export const T = {
  bn: {
    appName: 'টাকা যায় কই?', tagline: 'প্রতিটা টাকার হিসাব, এক ট্যাপে',
    navHome: 'হোম', navCharts: 'চার্ট', navCal: 'ক্যালেন্ডার', navMe: 'সেটিংস', add: 'যোগ করো',
    search: 'খুঁজুন', spentThisPeriod: 'এই মাসে খরচ', me: 'আমি', swapBook: 'খাতা বদলাও', oneBookOnly: 'একটাই শেয়ার্ড খাতা রাখা যায়। নতুনটায় যেতে আগে এখনকার খাতা ছেড়ে দাও।', sharedBook: 'শেয়ার্ড খাতা', myBook: 'আমার খাতা', myBookSub: 'শুধু তুমি দেখবে', removedFromBook: 'তোমাকে খাতা থেকে বাদ দেওয়া হয়েছে', pickBook: 'কোন খাতা দেখবে?', nMembers: '{n} জন সদস্য', manageBooks: 'শেয়ার্ড খাতা ম্যানেজ করো',
    sharedIntro: 'পরিবারের সবাই একই খাতায় খরচ লিখবে, আর দেখা যাবে কে কত খরচ করল। তোমার নিজের খাতা আলাদা আর গোপন থাকবে। একজন একটাই শেয়ার্ড খাতা রাখতে পারে।', owner: 'মালিক', member: 'সদস্য',
    createBook: 'নতুন শেয়ার্ড খাতা', createBookSub: 'খাতা খুললে একটা কোড পাবে, সেটা পরিবারকে দাও।', createBookPro: 'খাতা খুলতে Pro লাগবে। যোগ দিতে লাগবে না।', bookNamePh: 'খাতার নাম', familyBook: 'পরিবারের খাতা', createBtn: 'খাতা খোলো',
    joinBook: 'কোড দিয়ে যোগ দাও', joinBookSub: 'কেউ তোমাকে কোড দিলে এখানে বসাও। যোগ দেওয়া ফ্রি।', joinBtn: 'যোগ দাও', joined: 'খাতায় যোগ দিয়েছ 🎉', codeWrong: 'এই কোডের কোনো খাতা পাওয়া যায়নি',
    inviteCode: 'আমন্ত্রণ কোড', members: 'সদস্য', openBook: 'এই খাতায় যাও', leaveBook: 'খাতা ছেড়ে দাও', leaveConfirm: 'এই খাতা ছেড়ে দেবে? তুমি আর এর খরচ দেখতে পাবে না।', kickConfirm: 'এই সদস্যকে বাদ দেবে?', remove: 'বাদ দাও',
    inviteMsg: 'আমার "টাকা যায় কই?" খাতায় যোগ দাও। অ্যাপ খুলে সেটিংস → শেয়ার্ড খাতা → কোড দিন: {c}', whoSpent: 'কে কত খরচ করল',
    demoPartner: 'ডেমো: পরিবারের একজন সদস্য যোগ করো', demoPartnerDone: 'ডেমো সদস্য যোগ হয়েছে, তার কয়েকটা খরচসহ',
    ct_insights: 'ইনসাইট', in_sub: 'মাসের প্রথম {d} দিনের হিসাবে', in_proj: 'এই হারে চললে মাস শেষে মোট খরচ হবে প্রায় <b>{a}</b> টাকা',
    in_up: '<b>{c}</b>-এ গত মাসের এই সময়ের চেয়ে <b>{p}%</b> বেশি গেছে ({a} টাকা বেশি)', in_down: '<b>{c}</b>-এ গত মাসের এই সময়ের চেয়ে <b>{p}%</b> কম গেছে, সাবাস! ({a} টাকা বাঁচল)',
    in_wday: 'সবচেয়ে বেশি খরচ হয় <b>{d}</b> (মোট {a} টাকা)', in_zero: 'এই মাসে <b>{n} দিন</b> কোনো খরচ হয়নি 👏', in_nozero: 'এই মাসে প্রতিদিনই কিছু না কিছু খরচ হয়েছে',
    in_note: 'সবচেয়ে বেশি টাকা গেছে <b>{n}</b>-এ ({a} টাকা)', in_big: 'সবচেয়ে বড় একক খরচ <b>{n}</b>: {a} টাকা ({d})', getPro: 'Pro নাও',
    hideBtnSet: 'টাকা লুকানোর বাটন', hideBtnSub: 'চালু থাকলে অ্যাপ খুলবে মাসের মোট লুকানো অবস্থায়', security: 'নিরাপত্তা',
    appLock: 'অ্যাপ লক', appLockSub: 'আঙুলের ছাপ, ফেস বা ফোনের PIN দিয়ে খুলবে', lockAfter: 'কখন লক হবে', la_0: 'সাথে সাথে', la_60: '১ মিনিট', la_300: '৫ মিনিট',
    lockCancelled: 'লক চালু হয়নি', lockUnavailable: 'এই ফোনে আঙুলের ছাপ বা ফেস লক পাওয়া যায়নি', lockDemoAsk: 'এই ব্রাউজারে আঙুলের ছাপ চালানো যাচ্ছে না (ডেমো)। নকল লক দিয়ে দেখবে কেমন কাজ করে?',
    lockOn: 'অ্যাপ লক চালু হয়েছে 🔒', lockOff: 'অ্যাপ লক বন্ধ হয়েছে', lockedMsg: 'অ্যাপ লক করা আছে', unlockBtn: 'আনলক করো', unlockFail: 'আনলক হয়নি, আবার চেষ্টা করো',
    pf_insights: 'মাসের ইনসাইট', pd_insights: 'কোথায় খরচ বাড়ল-কমল, মাস শেষে কত হবে, নিজে থেকেই বলে দেয়', pf_shared: 'পরিবারের সাথে শেয়ার্ড খাতা', pd_shared: 'একই খাতায় সবাই লিখবে, কে কত খরচ করল দেখা যাবে',
    pf_lock: 'অ্যাপ লক', pd_lock: 'আঙুলের ছাপ বা ফেস দিয়ে অ্যাপ খুলবে', pf_hide: 'টাকা লুকানো মোড', pd_hide: 'এক চাপে মাসের মোট টাকা লুকিয়ে রাখো', themesFree: 'ফ্রি', themesPro: 'Pro', themesNewSolid: 'নতুন · একরঙা', themesGrad: 'নতুন · গ্রেডিয়েন্ট',
    seeBenefits: 'কী কী পাচ্ছ দেখো', comingSoon: 'শীঘ্রই আসছে', youGet: 'Pro-তে যা পাবে', youHave: 'তুমি যা পাচ্ছ',
    trialUsing: 'এখন এগুলো ফ্রিতে চালাচ্ছ, আর {d} দিন বাকি', proSince: '{d} থেকে Pro',
    pd_cats: 'ফ্রিতে ২০টি খাত, Pro-তে যত খুশি', pd_themes: '১৩টি বাড়তি রং, গ্রেডিয়েন্টসহ', pd_export: 'মাস বা বছরের হিসাব Excel আর PDF-এ', pd_recurring: 'ভাড়া, বিল প্রতি মাসে নিজে থেকেই যোগ হবে', pd_fx: 'টার্গেট রাখলে বা টানা লিখলে কনফেটি',
    ps_insights: 'মাসের ইনসাইট', psd_insights: 'কোথায় খরচ বাড়ল-কমল, নিজে থেকেই বলে দেবে',
    ps_shared: 'পরিবারের সাথে শেয়ার্ড খাতা', psd_shared: 'একই খাতায় সবাই লিখবে, কে কত খরচ করল দেখা যাবে',
    ps_lock: 'অ্যাপ লক', psd_lock: 'আঙুলের ছাপ বা ফেস দিয়ে অ্যাপ খুলবে',
    ps_hide: 'টাকা লুকানো মোড', psd_hide: 'এক চাপে মাসের মোট টাকা লুকিয়ে রাখো',
    shareTitle: 'অ্যাপটা শেয়ার করো', shareSub: 'বন্ধু বা পরিবারকে পাঠাও, তারাও হিসাব রাখতে পারবে।', shareBtn: 'শেয়ার করো', copyLink: 'লিংক কপি',
    shareMsg: 'মাসে টাকা কোথায় যায় দেখতে আমি এই অ্যাপটা ব্যবহার করি: টাকা যায় কই? 👉', demoPro: 'ডেমো: Pro সদস্য হিসেবে দেখো', demoTrialEnd: 'ডেমো: ট্রায়াল শেষ হয়ে গেছে', deleteBook: 'খাতাটা মুছে ফেলো', deleteBookConfirm: 'খাতাটা সবার জন্য মুছে যাবে, এর সব খরচসহ। আর ফেরত আনা যাবে না। মুছবে?', demoTrialEndSub: 'ফ্রি ইউজার কী দেখে, সেটা দেখো', aboutApp: 'অ্যাপ সম্পর্কে', privacy: 'প্রাইভেসি নোট', aboutDev: 'ডেভেলপার', devRole: 'ডেভেলপার · টাকা যায় কই?', copyEmail: 'ইমেইল কপি করো', devNote: 'মতামত, সমস্যা বা ডেটা মোছার অনুরোধ, এই ইমেইলে জানাও।', madeBy: 'তৈরি করেছেন', privacyBody: `<p><b>সংক্ষেপে:</b> তোমার খরচের হিসাব তোমারই। আমরা কখনো বিক্রি করি না, কারো সাথে শেয়ার করি না, বিজ্ঞাপনেও ব্যবহার করি না।</p>
<h4>কী রাখা হয়</h4><ul><li><b>ফোনে:</b> খরচ, খাত, টার্গেট আর সেটিংস। সাইন ইন না করলে সব শুধু তোমার ফোনেই থাকে।</li>
<li><b>ব্যাকআপে (সাইন ইন করলে):</b> তোমার ইমেইল, খরচ, খাত, টার্গেট আর সেটিংস Supabase-এর সার্ভারে (সিঙ্গাপুর) রাখা হয়, যাতে নতুন ফোনে ফেরত পাও।</li>
<li><b>Pro কিনলে:</b> bKash TrxID, ইমেইল আর পাঠানো নম্বরের শেষ ৪ সংখ্যা, শুধু পেমেন্ট যাচাইয়ের জন্য।</li></ul>
<h4>কে দেখতে পারে</h4><ul><li>অন্য কোনো ইউজার তোমার হিসাব দেখতে পারে না।</li>
<li>ব্যাকআপের ডেটা এনক্রিপ্টেড না। তাই ডেভেলপার সার্ভার চালানোর কাজে কারিগরিভাবে দেখতে পারে, তবে সমস্যা সমাধান ছাড়া দেখা হয় না।</li></ul>
<h4>অন্যান্য</h4><ul><li>কোনো বিজ্ঞাপন বা ট্র্যাকিং নেই।</li><li>আলাদা ফন্ট বেছে নিলে সেটা Google Fonts থেকে নামে।</li></ul>
<h4>ডেটা মুছতে চাইলে</h4><p>ফোন থেকে মুছতে সাইন আউট করো বা অ্যাপের ডেটা মুছে দাও। ব্যাকআপসহ পুরো অ্যাকাউন্ট মুছতে ডেভেলপারকে ইমেইল করো, ৭ দিনের মধ্যে মুছে দেওয়া হবে।</p>`, taka: 'টাকা', totalTaka: 'মোট টাকা', bigRule: 'মোটের ৪০%-এর বেশি', bigOff: 'বাদ', fontBn: 'বাংলা ফন্ট', fontEn: 'English ফন্ট', today: 'আজ', yesterday: 'গতকাল', avgDay: 'দৈনিক গড়', streak: 'টানা দিন',
    backToNow: 'এই মাসে ফেরো',
    howMuch: 'খরচ কত হল?', notePh: 'খরচের বিবরণ', pickDate: 'তারিখ', save: 'সেভ', more: 'আরও', newCat: 'নতুন খাত',
    enterAmount: 'টাকার পরিমাণ লেখো', pickCat: 'একটা খাত বেছে নাও', updated: 'আপডেট হয়েছে',
    tagBig: 'বড় খরচ', tagRec: 'নিয়মিত',
    emptyTitle: 'এখনো কোনো খরচ নেই', emptyPeriod: 'প্রথম খরচটা যোগ করো, তারপর এখানে হিসাব দেখাবে।', addFirst: 'খরচ যোগ করো',
    trialEnding: 'Pro ট্রায়াল আর {d} দিন আছে', payPendingShort: 'তোমার পেমেন্ট যাচাই হচ্ছে',
    backupNudge: 'ব্যাকআপ চালু করো', backupNudgeSub: 'একবার সাইন ইন করলেই হিসাব নিরাপদ থাকবে', turnOn: 'চালু করো',
    missedTitle: 'এই দিনগুলোতে কিছু লেখা হয়নি',
    targets: 'টার্গেট', edit: 'এডিট', pausedPro: 'Pro-তে চালু হবে', over: 'পার',
    setTargetsTitle: 'মাসিক টার্গেট ঠিক করো', setTargetsBody: 'কোন খাতে মাসে কত খরচ করবে', targetShort: '{a} / {b}',
    whereGoes: 'টাকা কোথায় যাচ্ছে', seeCharts: 'চার্ট দেখো', entries: 'খরচের তালিকা',
    ct_month: 'মাস', ct_year: 'বছর', ct_cat: 'খাত', ct_compare: 'তুলনা', cmpSameDays: 'এই মাসের প্রথম {d} দিন বনাম গত মাসের প্রথম {d} দিন', cmpFull: 'পুরো মাস বনাম আগের পুরো মাস',
    exBig: 'বড় খাত বাদ দিয়ে দেখাও', monthCard: 'মাসের কার্ড শেয়ার করো',
    perDay: 'প্রতিদিনের খরচ', avg: 'গড়', tapBar: 'কোনো দিনে ট্যাপ করলে সেদিনের খরচ দেখাবে', maxDay: 'সর্বোচ্চ দিন', zeroDays: 'খরচ নেই এমন দিন',
    perMonth: 'মাসওয়ারি খরচ', tapMonth: 'কোনো মাসে ট্যাপ করলে বিস্তারিত দেখাবে', yearTotal: 'বছরে মোট', avgMonth: 'মাসিক গড়', maxMonth: 'সর্বোচ্চ মাস',
    noData: 'দেখানোর মতো কিছু নেই', total: 'মোট', new: 'নতুন',
    cmpGood: 'গত মাসের একই সময়ের চেয়ে কম খরচ 👏', cmpBad: 'গত মাসের একই সময়ের চেয়ে বেশি খরচ', cmpLegend: 'রঙিন: এই মাস · ধূসর: গত মাস',
    calHint: 'দিনে ট্যাপ করে খরচ দেখো বা যোগ করো · ডানে-বামে সোয়াইপ করে মাস বদলাও',
    backupTitle: 'ব্যাকআপ', backupSub: 'একবার সাইন ইন করলেই সব সেভ থাকবে', backupOn: 'ব্যাকআপ চালু', backupOff: 'ব্যাকআপ বন্ধ',
    backupLong: 'একবার সাইন ইন করো। এরপর তোমার খরচ নিজে থেকেই ব্যাকআপ হবে, নতুন ফোনেও পাবে।',
    backupOnToast: 'ব্যাকআপ চালু হয়েছে ✓', syncing: 'সিঙ্ক হচ্ছে…', syncPending: '{n}টি খরচ আপলোডের অপেক্ষায়', syncedAt: 'শেষ সিঙ্ক {t}',
    signIn: 'সাইন ইন', newAccount: 'নতুন অ্যাকাউন্ট', haveAccount: 'আগের অ্যাকাউন্ট', createAccount: 'অ্যাকাউন্ট খোলো',
    email: 'ইমেইল', password: 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)', forgotPw: 'পাসওয়ার্ড ভুলে গেছ?', enterEmailFirst: 'আগে ইমেইল লেখো', resetSent: 'রিসেট লিংক ইমেইলে পাঠানো হয়েছে',
    demoNote: 'ডেমো মোড: অ্যাকাউন্ট আর ব্যাকআপ শুধু এই ব্রাউজারে রাখা হচ্ছে।',
    errCred: 'ইমেইল বা পাসওয়ার্ড মিলছে না', errExists: 'এই ইমেইলে আগেই অ্যাকাউন্ট আছে। "আগের অ্যাকাউন্ট" চাপো।', errWeak: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    errEmail: 'ইমেইলটা ঠিক নেই', errMany: 'অনেকবার চেষ্টা হয়েছে, একটু পরে করো', errDemoReset: 'ডেমোতে পাসওয়ার্ড রিসেট নেই', errGeneric: 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করো', errNotConfirmed: 'আগে ইমেইলে পাঠানো লিংকে ট্যাপ করে ভেরিফাই করো', confirmEmailSent: '{e} ঠিকানায় একটা লিংক গেছে। ভেরিফাই করে এখানে সাইন ইন করো।', newPwTitle: 'নতুন পাসওয়ার্ড দাও', pwUpdated: 'পাসওয়ার্ড বদলে গেছে ✓', netError: 'ইন্টারনেট সংযোগ দেখো',
    logout: 'সাইন আউট', logoutConfirm: 'সাইন আউট করলে এই ফোন থেকে হিসাব সরে যাবে, ব্যাকআপে থেকে যাবে।', logoutUnsynced: 'কিছু খরচ এখনো আপলোড হয়নি। ইন্টারনেট চালু করে আবার চেষ্টা করো।', loggedOut: 'সাইন আউট হয়েছে',
    proTitle: 'Pro নাও, মাত্র ৳{p}', proSub: 'একবার পেমেন্ট, সারাজীবন', trialLeft: 'Pro ট্রায়াল আর {d} দিন', proMember: 'তুমি Pro সদস্য',
    mySetup: 'আমার সেটআপ', categories: 'খাত', recurring: 'নিয়মিত খরচ', export: 'এক্সপোর্ট', monthStart: 'মাস শুরু', monthStartV: '{d} তারিখ',
    looks: 'দেখতে', theme: 'রং', mode: 'মোড', mode_light: 'লাইট', mode_dark: 'ডার্ক', mode_system: 'অটো', language: 'ভাষা', digits: 'সংখ্যা',
    badges: 'ব্যাজ', adminPage: 'অ্যাডমিন: পেমেন্ট যাচাই',
    b_first: 'শুরু', bh_first: 'প্রথম খরচ লেখো', b_s7: '৭ দিন টানা', bh_s7: '৭ দিন টানা লেখো', b_s30: '৩০ দিন টানা', bh_s30: '৩০ দিন টানা লেখো',
    b_smart: 'বুদ্ধিমান খরচ', bh_smart: 'মাস শেষে টার্গেটের মধ্যে থাকো', b_kept: 'সব টার্গেট রাখা', bh_kept: 'মাসে সব টার্গেট রাখো',
    newBadge: '🏅 নতুন ব্যাজ!', cheerBackfill: 'আপডেট হয়ে গেল 👍',
    targetCrossed: '{c}: টার্গেট পার হয়ে গেছে', targetNear: '{c}: টার্গেটের কাছাকাছি', streakCheer: '🔥 টানা {n} দিন!',
    delConfirm: 'এই খরচটা মুছে ফেলবে?', delete: 'মুছে ফেলো', deleted: 'মুছে ফেলা হয়েছে', cancel: 'বাতিল', yes: 'হ্যাঁ',
    editCat: 'খাত এডিট', editingOld: 'পুরানো খরচ এডিট করছ', update: 'আপডেট', entryEdit: 'এডিট করো', searchExp: 'খরচ খুঁজুন', catNamePh: 'খাতের নাম', suggested: 'সাজেশন', pickIcon: 'আইকন', catNameReq: 'একটা নাম দাও', catExists: 'এই নামে খাত আগেই আছে',
    hide: 'লুকাও', show: 'দেখাও', hidden: 'লুকানো', catsBody: 'ট্যাপ করে নাম বা আইকন বদলাও। যেটা লাগে না সেটা লুকিয়ে রাখো।',
    noNote: 'নোট নেই', targetOf: 'টার্গেট {a}', overBy: '{a} বেশি খরচ হয়েছে', leftAmt: 'আরও {a} বাকি', setTargetFor: 'এই খাতে টার্গেট দাও',
    byNote: 'কিসে কত গেল', addHere: 'এই খাতে যোগ করো', nEntries: '{n}টি খরচ', nothingYet: 'কিছু লেখা নেই', addThisDay: 'এই দিনের খরচ যোগ করো',
    searchPh: 'নোট বা খাত খুঁজুন', frequent: 'বেশি ব্যবহৃত', searchHint: 'নোট বা খাতের নাম লিখে খোঁজো', noResult: 'কিছু পাওয়া যায়নি', allTime: 'সব মিলিয়ে', thisMonth: 'এই মাসে',
    targetsBody: 'যে খাতে নজর রাখতে চাও, শুধু সেখানে মাসের লিমিট দাও।', freeTargetsN: 'ফ্রিতে {n}টি টার্গেট', saved: 'সেভ হয়েছে',
    recBody: 'ভাড়া, বিলের মতো প্রতি মাসের খরচ নিজে থেকেই যোগ হবে।', recEvery: 'প্রতি মাসের {d} তারিখে', recNew: 'নতুন নিয়মিত খরচ', recNotePh: 'নাম (যেমন: বাসা ভাড়া)', recDay: 'তারিখ', amount: 'টাকা',
    recDelConfirm: 'এটা বন্ধ করে মুছে ফেলবে? আগের খরচগুলো থেকে যাবে।',
    proName: 'Pro', why_cats: 'ফ্রিতে ২০টি খাত রাখা যায়', catCount: '{n}/{m}টি খাত', why_themes: 'এই রংটা Pro-তে আছে', why_export: 'এক্সপোর্ট Pro-তে আছে', why_recurring: 'নিয়মিত খরচ Pro-তে আছে',
    pf_cats: '২০টির বেশি খাত', pf_themes: 'আরও ১৩টি রং', pf_export: 'Excel ও PDF রিপোর্ট', pf_recurring: 'নিয়মিত খরচ নিজে থেকে যোগ হবে', pf_fx: 'বাড়তি অ্যানিমেশন',
    oneTime: 'একবারই', payBkash: 'bKash দিয়ে নাও', freeForever: 'খরচ লেখা, চার্ট আর ব্যাকআপ সবসময় ফ্রি', youArePro: 'তুমি এখন Pro!', thanks: 'সাপোর্ট করার জন্য ধন্যবাদ', done: 'ঠিক আছে',
    proActivated: 'Pro চালু হয়েছে! 🎉',
    payPending: 'যাচাই হচ্ছে, সাধারণত কয়েক ঘণ্টা লাগে', payRejected: 'আগের TrxID মেলেনি। ঠিকটা দিয়ে আবার পাঠাও।',
    step1: 'bKash থেকে এই নম্বরে <b>৳{p}</b> Send Money করো', step2: 'মেসেজ থেকে TrxID কপি করো', step3: 'নিচে বসিয়ে পাঠাও',
    senderLast: 'যে নম্বর থেকে পাঠালে, তার শেষ ৪ সংখ্যা (ঐচ্ছিক)', submitTrx: 'TrxID পাঠাও', waiting: 'অপেক্ষা করছি…', copy: 'কপি', copied: 'কপি হয়েছে',
    payNote: 'যাচাই হলে Pro নিজে থেকেই চালু হবে।', trxInvalid: 'TrxID ঠিক নেই (৮–১২টি ইংরেজি অক্ষর/সংখ্যা)', trxDup: 'এই TrxID আগেই জমা পড়েছে', trxSent: 'পাঠানো হয়েছে ✓',
    exportBody: 'Excel ফাইল নামবে। PDF-এর জন্য প্রিন্ট পাতা খুলবে।', date: 'তারিখ', category: 'খাত', note: 'নোট', popupBlocked: 'পপআপ বন্ধ আছে',
    cardTargets: '{n}টির মধ্যে {k}টি টার্গেট রাখা', cardStreak: 'সেরা: টানা {n} দিন', share: 'শেয়ার',
    monthStartBody: 'বেতনের দিন থেকে মাস গুনতে চাইলে তারিখ বদলাও। যেমন ২৫ দিলে ২৫ তারিখ থেকে পরের মাসের ২৪ তারিখ পর্যন্ত।',
  },
  en: {
    appName: 'Money Tracking', tagline: 'Every taka, one tap away',
    navHome: 'Home', navCharts: 'Charts', navCal: 'Calendar', navMe: 'Settings', add: 'Add',
    search: 'Search', spentThisPeriod: 'Spent this month', me: 'Me', swapBook: 'Swap book', oneBookOnly: 'You can have one shared book. Leave your current one first to join another.', sharedBook: 'Shared book', myBook: 'My book', myBookSub: 'Only you see this', removedFromBook: 'You were removed from the book', pickBook: 'Which book?', nMembers: '{n} members', manageBooks: 'Manage shared books',
    sharedIntro: 'Everyone in the family logs in one book and you see who spent what. Your own book stays separate and private. Each person can have one shared book.', owner: 'Owner', member: 'Member',
    createBook: 'New shared book', createBookSub: "You'll get a code to give your family.", createBookPro: 'Creating a book needs Pro. Joining is free.', bookNamePh: 'Book name', familyBook: 'Family book', createBtn: 'Create book',
    joinBook: 'Join with a code', joinBookSub: 'If someone gave you a code, enter it here. Joining is free.', joinBtn: 'Join', joined: 'You joined the book 🎉', codeWrong: 'No book found with this code',
    inviteCode: 'Invite code', members: 'Members', openBook: 'Open this book', leaveBook: 'Leave book', leaveConfirm: "Leave this book? You won't see its expenses any more.", kickConfirm: 'Remove this member?', remove: 'Remove',
    inviteMsg: 'Join my Money Tracking book. Open the app → Settings → Shared book → enter code: {c}', whoSpent: 'Who spent how much',
    demoPartner: 'Demo: add a family member', demoPartnerDone: 'Demo member added with a few expenses',
    ct_insights: 'Insights', in_sub: 'Based on the first {d} days of the month', in_proj: 'At this pace the month will end at about <b>{a}</b> taka',
    in_up: '<b>{c}</b> is up <b>{p}%</b> on the same point last month ({a} more)', in_down: '<b>{c}</b> is down <b>{p}%</b> on the same point last month, nice! ({a} saved)',
    in_wday: 'You spend the most on <b>{d}</b> ({a} in total)', in_zero: '<b>{n} days</b> with no spending this month 👏', in_nozero: 'You spent something every day this month',
    in_note: 'The most money went on <b>{n}</b> ({a})', in_big: 'Biggest single expense <b>{n}</b>: {a} ({d})', getPro: 'Get Pro',
    hideBtnSet: 'Hide money button', hideBtnSub: "When on, the app opens with the month's total hidden", security: 'Security',
    appLock: 'App lock', appLockSub: "Open with fingerprint, face or the phone's PIN", lockAfter: 'Lock after', la_0: 'Instantly', la_60: '1 min', la_300: '5 min',
    lockCancelled: 'App lock was not turned on', lockUnavailable: 'No fingerprint or face lock found on this phone', lockDemoAsk: "Fingerprint isn't available in this browser (demo). Try a pretend lock to see how it works?",
    lockOn: 'App lock is on 🔒', lockOff: 'App lock is off', lockedMsg: 'The app is locked', unlockBtn: 'Unlock', unlockFail: "Couldn't unlock, try again",
    pf_insights: 'Monthly insights', pd_insights: 'Shows where spending went up or down and where the month will end', pf_shared: 'Shared family book', pd_shared: 'Everyone logs in one book and sees who spent what',
    pf_lock: 'App lock', pd_lock: 'Open the app with fingerprint or face', pf_hide: 'Hide money mode', pd_hide: "Hide the month's total with one tap", themesFree: 'Free', themesPro: 'Pro', themesNewSolid: 'New · solid', themesGrad: 'New · gradient',
    seeBenefits: 'See what you get', comingSoon: 'Coming soon', youGet: 'What Pro gives you', youHave: 'What you have',
    trialUsing: "You're using these free for {d} more day(s)", proSince: 'Pro since {d}',
    pd_cats: '20 categories free, unlimited with Pro', pd_themes: '13 extra colours, including gradients', pd_export: 'Month or year reports in Excel and PDF', pd_recurring: 'Rent and bills added automatically every month', pd_fx: 'Confetti when you keep targets or streaks',
    ps_insights: 'Monthly insights', psd_insights: 'Tells you where spending went up or down',
    ps_shared: 'Shared family book', psd_shared: 'Everyone logs in one book and sees who spent what',
    ps_lock: 'App lock', psd_lock: 'Open the app with fingerprint or face',
    ps_hide: 'Hide money mode', psd_hide: "Hide the month's total with one tap",
    shareTitle: 'Share the app', shareSub: 'Send it to friends or family so they can track too.', shareBtn: 'Share', copyLink: 'Copy link',
    shareMsg: 'I use this app to see where my money goes each month: Money Tracking 👉', demoPro: 'Demo: view as a Pro member', demoTrialEnd: 'Demo: trial has ended', deleteBook: 'Delete this book', deleteBookConfirm: 'The book and all its expenses will be deleted for everyone. This cannot be undone. Delete?', demoTrialEndSub: 'See what a free user sees', aboutApp: 'About', privacy: 'Privacy note', aboutDev: 'Developer', devRole: 'Developer · Money Tracking', copyEmail: 'Copy email', devNote: 'Feedback, problems or a data-deletion request: write to this email.', madeBy: 'Made by', privacyBody: `<p><b>In short:</b> your expenses are yours. We never sell them, share them, or use them for ads.</p>
<h4>What is stored</h4><ul><li><b>On your phone:</b> expenses, categories, targets and settings. Without signing in, everything stays only on your phone.</li>
<li><b>In backup (if you sign in):</b> your email, expenses, categories, targets and settings are kept on Supabase servers (Singapore) so you can restore them on a new phone.</li>
<li><b>If you buy Pro:</b> the bKash TrxID, your email and the last 4 digits of the sending number, only to verify the payment.</li></ul>
<h4>Who can see it</h4><ul><li>Other users can't see your data.</li>
<li>Backup data is not encrypted, so the developer can technically access it while running the server. It is only looked at to fix a problem.</li></ul>
<h4>Other</h4><ul><li>No ads, no tracking.</li><li>If you pick an extra font, it downloads from Google Fonts.</li></ul>
<h4>Deleting your data</h4><p>To remove data from your phone, sign out or clear the app's data. To delete your whole account including the backup, email the developer; it will be deleted within 7 days.</p>`, taka: 'Taka', totalTaka: 'Total taka', bigRule: 'Over 40% of the total', bigOff: 'Hidden', fontBn: 'Bangla font', fontEn: 'English font', today: 'Today', yesterday: 'Yesterday', avgDay: 'Daily avg', streak: 'Streak',
    backToNow: 'Back to this month',
    howMuch: 'How much did you spend?', notePh: 'Expense details', pickDate: 'Date', save: 'Save', more: 'More', newCat: 'New category',
    enterAmount: 'Enter an amount', pickCat: 'Pick a category', updated: 'Updated',
    tagBig: 'Big expense', tagRec: 'Recurring',
    emptyTitle: 'No expenses yet', emptyPeriod: 'Add your first expense and your summary will show up here.', addFirst: 'Add expense',
    trialEnding: 'Pro trial ends in {d} day(s)', payPendingShort: 'Your payment is being checked',
    backupNudge: 'Turn on backup', backupNudgeSub: 'Sign in once and your data stays safe', turnOn: 'Turn on',
    missedTitle: 'Nothing logged on these days',
    targets: 'Targets', edit: 'Edit', pausedPro: 'Active with Pro', over: 'Over',
    setTargetsTitle: 'Set monthly targets', setTargetsBody: 'Limit what you spend per category', targetShort: '{a} / {b}',
    whereGoes: 'Where it goes', seeCharts: 'Charts', entries: 'Expenses',
    ct_month: 'Month', ct_year: 'Year', ct_cat: 'Category', ct_compare: 'Compare', cmpSameDays: 'First {d} days of this month vs the same days last month', cmpFull: 'Full month vs the month before',
    exBig: 'Hide the biggest category', monthCard: 'Share month card',
    perDay: 'Per day', avg: 'avg', tapBar: 'Tap a day to see its expenses', maxDay: 'Highest day', zeroDays: 'No-spend days',
    perMonth: 'Per month', tapMonth: 'Tap a month for details', yearTotal: 'Year total', avgMonth: 'Monthly avg', maxMonth: 'Top month',
    noData: 'Nothing to show yet', total: 'Total', new: 'new',
    cmpGood: 'Less than the same point last month 👏', cmpBad: 'More than the same point last month', cmpLegend: 'Colour: this month · Grey: last month',
    calHint: 'Tap a day to see or add expenses · swipe left/right to change month',
    backupTitle: 'Backup', backupSub: 'Sign in once and everything is saved', backupOn: 'Backup on', backupOff: 'Backup off',
    backupLong: 'Sign in once. Your expenses back up automatically and come with you to a new phone.',
    backupOnToast: 'Backup is on ✓', syncing: 'Syncing…', syncPending: '{n} waiting to upload', syncedAt: 'Last synced {t}',
    signIn: 'Sign in', newAccount: 'New account', haveAccount: 'I have an account', createAccount: 'Create account',
    email: 'Email', password: 'Password (6+ characters)', forgotPw: 'Forgot password?', enterEmailFirst: 'Type your email first', resetSent: 'Reset link sent to your email',
    demoNote: 'Demo: account and backup are kept in this browser only.',
    errCred: "Email or password doesn't match", errExists: 'That email already has an account. Tap "I have an account".', errWeak: 'Use at least 6 characters',
    errEmail: "That email doesn't look right", errMany: 'Too many tries, wait a bit', errDemoReset: 'No password reset in the demo', errGeneric: 'Something went wrong, try again', errNotConfirmed: 'Tap the link we emailed you first', confirmEmailSent: 'We sent a link to {e}. Verify it, then sign in here.', newPwTitle: 'Set a new password', pwUpdated: 'Password updated ✓', netError: 'Check your internet connection',
    logout: 'Sign out', logoutConfirm: 'Signing out removes the data from this phone. It stays in your backup.', logoutUnsynced: "Some expenses haven't uploaded yet. Go online and try again.", loggedOut: 'Signed out',
    proTitle: 'Get Pro for ৳{p}', proSub: 'Pay once, keep it forever', trialLeft: 'Pro trial: {d} day(s) left', proMember: "You're Pro",
    mySetup: 'My setup', categories: 'Categories', recurring: 'Recurring', export: 'Export', monthStart: 'Month starts', monthStartV: 'day {d}',
    looks: 'Appearance', theme: 'Colour', mode: 'Mode', mode_light: 'Light', mode_dark: 'Dark', mode_system: 'Auto', language: 'Language', digits: 'Digits',
    badges: 'Badges', adminPage: 'Admin: verify payments',
    b_first: 'Started', bh_first: 'Log your first expense', b_s7: '7-day streak', bh_s7: 'Log 7 days in a row', b_s30: '30-day streak', bh_s30: 'Log 30 days in a row',
    b_smart: 'Smart spender', bh_smart: 'End a month within targets', b_kept: 'All targets kept', bh_kept: 'Keep every target in a month',
    newBadge: '🏅 New badge!', cheerBackfill: 'All caught up 👍',
    targetCrossed: '{c}: target crossed', targetNear: '{c}: close to target', streakCheer: '🔥 {n} days in a row!',
    delConfirm: 'Delete this expense?', delete: 'Delete', deleted: 'Deleted', cancel: 'Cancel', yes: 'Yes',
    editCat: 'Edit category', editingOld: 'Editing an older expense', update: 'Update', entryEdit: 'Edit', searchExp: 'Search expenses', catNamePh: 'Category name', suggested: 'Suggestions', pickIcon: 'Icon', catNameReq: 'Give it a name', catExists: 'A category with this name exists',
    hide: 'Hide', show: 'Show', hidden: 'Hidden', catsBody: "Tap to rename or change the icon. Hide the ones you don't use.",
    noNote: 'No note', targetOf: 'Target {a}', overBy: 'Over by {a}', leftAmt: '{a} left', setTargetFor: 'Set a target for this',
    byNote: 'What it went on', addHere: 'Add to this category', nEntries: '{n} expenses', nothingYet: 'Nothing logged', addThisDay: 'Add an expense for this day',
    searchPh: 'Search notes or categories', frequent: 'Frequent', searchHint: 'Search by note or category', noResult: 'Nothing found', allTime: 'All time', thisMonth: 'This month',
    targetsBody: 'Set a monthly limit only where you want to keep watch.', freeTargetsN: 'Free plan: {n} targets', saved: 'Saved',
    recBody: 'Rent, bills and other monthly costs get added automatically.', recEvery: 'Every month on day {d}', recNew: 'New recurring expense', recNotePh: 'Name (e.g. House rent)', recDay: 'Day', amount: 'Amount',
    recDelConfirm: 'Stop and delete this? Past expenses stay.',
    proName: 'Pro', why_cats: 'The free plan has 20 categories', catCount: '{n}/{m} categories', why_themes: 'This colour is in Pro', why_export: 'Export is in Pro', why_recurring: 'Recurring is in Pro',
    pf_cats: 'More than 20 categories', pf_themes: '13 more colours', pf_export: 'Excel & PDF reports', pf_recurring: 'Recurring expenses added automatically', pf_fx: 'Extra animations',
    oneTime: 'one time', payBkash: 'Pay with bKash', freeForever: 'Logging, charts and backup are always free', youArePro: "You're Pro!", thanks: 'Thanks for the support', done: 'Done',
    proActivated: 'Pro is on! 🎉',
    payPending: 'Being checked, usually within a few hours', payRejected: "The last TrxID didn't match. Send the correct one.",
    step1: 'Send Money <b>৳{p}</b> to this bKash number', step2: 'Copy the TrxID from the message', step3: 'Paste it below and send',
    senderLast: 'Last 4 digits of the number you paid from (optional)', submitTrx: 'Send TrxID', waiting: 'Waiting…', copy: 'Copy', copied: 'Copied',
    payNote: 'Pro turns on by itself once verified.', trxInvalid: 'TrxID looks wrong (8–12 letters/digits)', trxDup: 'This TrxID was already submitted', trxSent: 'Sent ✓',
    exportBody: 'Excel downloads a file. PDF opens a print page.', date: 'Date', category: 'Category', note: 'Note', popupBlocked: 'Pop-ups are blocked',
    cardTargets: '{k} of {n} targets kept', cardStreak: 'Best streak: {n} days', share: 'Share',
    monthStartBody: 'Want your month to start on payday? Pick the day. E.g. 25 means the 25th to the 24th of next month.',
  },
};

export const MONTHS = {
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export const MONTHS_S = {
  bn: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
export const WDAYS = {
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
export const WDAYS_S = {
  bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
};
export const CHEERS = {
  bn: ['সাবাস!', 'দারুণ!', 'চমৎকার!', 'একদম ঠিক!', 'বাহ্‌!'],
  en: ['Nice!', 'Great!', 'Awesome!', 'Spot on!', 'Well done!'],
};

export const CAT_COLORS = ['#F97316', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#06B6D4', '#EF4444', '#64748B', '#EAB308', '#14B8A6', '#8B5CF6', '#F43F5E', '#0EA5E9', '#84CC16', '#D946EF', '#78716C'];

// 8 everyday categories to start with
export const CATS = [
  { id: 'food', bn: 'খাবার', en: 'Food', emoji: '🍽️', color: '#F97316' },
  { id: 'grocery', bn: 'বাজার', en: 'Groceries', emoji: '🛒', color: '#22C55E' },
  { id: 'transport', bn: 'যাতায়াত', en: 'Transport', emoji: '🚌', color: '#3B82F6' },
  { id: 'bills', bn: 'বিল ও ভাড়া', en: 'Bills & rent', emoji: '🏠', color: '#A855F7' },
  { id: 'shopping', bn: 'কেনাকাটা', en: 'Shopping', emoji: '🛍️', color: '#EC4899' },
  { id: 'mobile', bn: 'মোবাইল ও নেট', en: 'Mobile & net', emoji: '📱', color: '#06B6D4' },
  { id: 'health', bn: 'চিকিৎসা', en: 'Health', emoji: '💊', color: '#EF4444' },
  { id: 'other', bn: 'অন্যান্য', en: 'Other', emoji: '📦', color: '#64748B' },
];

// One-tap suggestions in "New category"
export const PRESETS = [
  { bn: 'চা-নাস্তা', en: 'Snacks', emoji: '☕' },
  { bn: 'পড়াশোনা', en: 'Education', emoji: '📚' },
  { bn: 'উপহার', en: 'Gifts', emoji: '🎁' },
  { bn: 'বিনোদন', en: 'Entertainment', emoji: '🎬' },
  { bn: 'ভ্রমণ', en: 'Travel', emoji: '✈️' },
  { bn: 'বাচ্চা', en: 'Kids', emoji: '🧸' },
  { bn: 'সাজসজ্জা', en: 'Personal care', emoji: '💄' },
  { bn: 'ঘরের জিনিস', en: 'Household', emoji: '🧺' },
  { bn: 'জ্বালানি', en: 'Fuel', emoji: '⛽' },
  { bn: 'দান', en: 'Charity', emoji: '🤲' },
  { bn: 'পোষা প্রাণী', en: 'Pets', emoji: '🐾' },
  { bn: 'ফিটনেস', en: 'Fitness', emoji: '🏋️' },
];

// 3 free + 6 Pro
export const THEMES = [
  { id: 'red', bn: 'লাল', en: 'Red', color: '#E11D48', free: true },
  { id: 'pink', bn: 'গোলাপি', en: 'Pink', color: '#DB2777', free: true },
  { id: 'green', bn: 'সবুজ', en: 'Green', color: '#16A34A', free: true },
  { id: 'maroon', bn: 'মেরুন', en: 'Maroon', color: '#9F1239' },
  { id: 'purple', bn: 'বেগুনি', en: 'Purple', color: '#9333EA' },
  { id: 'amber', bn: 'হলুদ', en: 'Amber', color: '#D97706' },
  { id: 'blue', bn: 'নীল', en: 'Blue', color: '#2563EB' },
  { id: 'teal', bn: 'টিল', en: 'Teal', color: '#0D9488' },
  { id: 'orange', bn: 'কমলা', en: 'Orange', color: '#EA580C' },
  // new Pro colours — solid
  { id: 'indigo', bn: 'ইন্ডিগো', en: 'Indigo', color: '#4F46E5', isNew: true },
  { id: 'fuchsia', bn: 'ফুশিয়া', en: 'Fuchsia', color: '#C026D3', isNew: true },
  { id: 'charcoal', bn: 'চারকোল', en: 'Charcoal', color: '#334155', isNew: true },
  { id: 'coffee', bn: 'কফি', en: 'Coffee', color: '#92400E', isNew: true },
  // new Pro colours — gradient (color → g)
  { id: 'sunset', bn: 'সূর্যাস্ত', en: 'Sunset', color: '#F43F5E', g: '#F97316', free: true },
  { id: 'ocean', bn: 'সমুদ্র', en: 'Ocean', color: '#0284C7', g: '#14B8A6', isNew: true },
  { id: 'aurora', bn: 'অরোরা', en: 'Aurora', color: '#7C3AED', g: '#06B6D4', isNew: true },
  { id: 'midnight', bn: 'মাঝরাত', en: 'Midnight', color: '#1E3A8A', g: '#7C3AED', isNew: true },
];

export const EMOJI_GROUPS = [
  { id: 'food', bn: 'খাবার', en: 'Food & drink', list: ['🍽️', '🍔', '🍕', '🍟', '🌭', '🥪', '🌮', '🍜', '🍝', '🍛', '🍚', '🍣', '🍱', '🥟', '🍤', '🍗', '🍖', '🥩', '🐟', '🦐', '🥚', '🥛', '🧀', '🍞', '🥐', '🍰', '🎂', '🍩', '🍪', '🍫', '🍬', '🍦', '☕', '🍵', '🧃', '🥤', '🧋', '🍺'] },
  { id: 'grocery', bn: 'বাজার', en: 'Groceries', list: ['🛒', '🧺', '🍎', '🍌', '🍊', '🍉', '🍇', '🍓', '🥭', '🍍', '🥥', '🥕', '🥔', '🧅', '🧄', '🌶️', '🥬', '🥦', '🍅', '🍆', '🌽', '🫘', '🧂'] },
  { id: 'transport', bn: 'যাতায়াত', en: 'Transport', list: ['🚌', '🚗', '🚕', '🛺', '🏍️', '🛵', '🚲', '🚆', '🚇', '🚢', '⛴️', '✈️', '🚁', '⛽', '🅿️', '🚦', '🛞', '🔧'] },
  { id: 'home', bn: 'বাসা ও বিল', en: 'Home & bills', list: ['🏠', '🏢', '🛏️', '🛋️', '🚿', '🛁', '🧹', '🧼', '🧴', '🪣', '💡', '🔌', '🔥', '💧', '📶', '📺', '❄️', '🪴', '🔑', '🛠️'] },
  { id: 'shop', bn: 'কেনাকাটা', en: 'Shopping & style', list: ['🛍️', '👕', '👖', '👗', '🥻', '👔', '🧥', '👟', '👠', '👜', '🎒', '👓', '⌚', '💍', '💄', '💅', '💇', '✂️'] },
  { id: 'health', bn: 'স্বাস্থ্য', en: 'Health', list: ['💊', '🩺', '💉', '🏥', '🦷', '🩹', '🧪', '🌡️', '🧘', '🏋️'] },
  { id: 'family', bn: 'পরিবার ও পড়াশোনা', en: 'Family & study', list: ['👶', '🍼', '🧸', '👪', '🎓', '📚', '✏️', '🏫', '📝', '🐾', '🐈', '🐕'] },
  { id: 'fun', bn: 'বিনোদন ও ভ্রমণ', en: 'Fun & travel', list: ['🎬', '🎮', '🎵', '🎧', '📷', '🎨', '⚽', '🏏', '🏸', '🎳', '🎟️', '🏖️', '🏕️', '⛰️', '🗺️', '🧳', '🎉', '🎁', '🎈'] },
  { id: 'money', bn: 'টাকা ও কাজ', en: 'Money & work', list: ['💳', '🏦', '💰', '💵', '🪙', '📈', '🧾', '💼', '💻', '🖨️', '📱', '📞', '📮', '📦', '🤝'] },
  { id: 'other', bn: 'অন্যান্য', en: 'Other', list: ['🤲', '🙏', '🕌', '🛕', '⛪', '❤️', '🌱', '🏷️', '⭐', '❓'] },
];
export const EMOJIS = EMOJI_GROUPS.flatMap(g => g.list);

// Font choices. Bangla font #1 is bundled (works offline); the rest load from Google Fonts.
export const FONTS_BN = [
  { id: 'hind', name: 'হিন্দ শিলিগুড়ি', css: "'Hind Siliguri'" },
  { id: 'noto', name: 'নোটো সান্স বাংলা', css: "'Noto Sans Bengali'", g: 'Noto+Sans+Bengali:wght@400;500;600;700' },
  { id: 'anek', name: 'আনেক বাংলা', css: "'Anek Bangla'", g: 'Anek+Bangla:wght@400;500;600;700' },
  { id: 'baloo', name: 'বালু দা', css: "'Baloo Da 2'", g: 'Baloo+Da+2:wght@400;500;600;700' },
  { id: 'serif', name: 'নোটো সেরিফ বাংলা', css: "'Noto Serif Bengali'", g: 'Noto+Serif+Bengali:wght@400;500;600;700' },
];
export const FONTS_EN = [
  { id: 'system', name: 'System', css: "Roboto, 'Segoe UI', -apple-system, 'Helvetica Neue', Arial" },
  { id: 'inter', name: 'Inter', css: "'Inter'", g: 'Inter:wght@400;500;600;700' },
  { id: 'poppins', name: 'Poppins', css: "'Poppins'", g: 'Poppins:wght@400;500;600;700' },
  { id: 'nunito', name: 'Nunito', css: "'Nunito'", g: 'Nunito:wght@400;600;700' },
  { id: 'dmsans', name: 'DM Sans', css: "'DM Sans'", g: 'DM+Sans:wght@400;500;600;700' },
];

export const DEVELOPER = { name: 'Tazammul Hossain Taz', email: 'tazammul.h.t@gmail.com' };
