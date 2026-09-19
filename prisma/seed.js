const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing records to ensure idempotency
  await prisma.bookmark.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.schemeRule.deleteMany({});
  await prisma.scheme.deleteMany({});

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bharatone.in' },
    update: {},
    create: {
      email: 'admin@bharatone.in',
      password: adminPasswordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin user seeded:', admin.email);

  // 2. Create Scheme Manager User
  const managerPasswordHash = await bcrypt.hash('Manager@123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@bharatone.in' },
    update: {},
    create: {
      email: 'manager@bharatone.in',
      password: managerPasswordHash,
      name: 'Scheme Manager',
      role: 'SCHEME_MANAGER',
    },
  });
  console.log('Scheme Manager user seeded:', manager.email);

  // 3. Create Demo User (Rahul Sharma)
  const userPasswordHash = await bcrypt.hash('Rahul@123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'rahul@gmail.com' },
    update: {},
    create: {
      email: 'rahul@gmail.com',
      password: userPasswordHash,
      name: 'Rahul Sharma',
      role: 'USER',
    },
  });
  console.log('Demo user seeded:', user.email);

  // Create profile for Rahul Sharma
  // Profile completion: approx 85% (missing a few fields like landOwned which is default, housingStatus, etc.)
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      dob: '2002-05-15',
      age: 24,
      gender: 'Male',
      state: 'Maharashtra',
      district: 'Mumbai Suburbs',
      areaType: 'Urban',
      annualIncome: 240000,
      occupation: 'Student',
      employmentStatus: 'Student',
      education: 'Graduate',
      casteCategory: 'General',
      isEws: true,
      isDifferentlyAbled: false,
      isStudent: true,
      isFarmer: false,
      isSeniorCitizen: false,
      familySize: 4,
      dependentsCount: 1,
      housingStatus: 'Rented',
      landOwned: 0.0,
    },
  });
  console.log('Profile seeded for user:', user.name);

  // 4. Seed Schemes
  const schemesData = [
    {
      name: 'PM Kisan Samman Nidhi',
      nameHi: 'पीएम किसान सम्मान निधि',
      nameMr: 'पीएम किसान सन्मान निधी',
      description: 'An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments to all landholding farmer families to support financial needs.',
      descriptionHi: 'भारत सरकार की एक पहल जिसके तहत सभी भूमिधारक किसान परिवारों को वित्तीय सहायता प्रदान करने के लिए प्रति वर्ष ₹6,000 तीन समान किस्तों में दिए जाते हैं।',
      descriptionMr: 'भारत सरकारचा उपक्रम ज्याद्वारे सर्व शेतकरी कुटुंबांना आर्थिक मदत देण्यासाठी वर्षाला ₹६,००० तीन समान हप्त्यांमध्ये दिले जातात.',
      benefits: 'Direct benefit transfer of ₹6,000 per year in three installments of ₹2,000 each directly into the bank accounts of farmers.',
      benefitsHi: 'किसानों के बैंक खातों में सीधे ₹2,000 की तीन किस्तों में प्रति वर्ष ₹6,000 का प्रत्यक्ष लाभ हस्तांतरण।',
      benefitsMr: 'शेतकऱ्यांच्या बँक खात्यात थेट ₹२,००० च्या तीन हप्त्यांमध्ये वर्षाला ₹६,००० चे थेट लाभ हस्तांतरण.',
      category: 'Agriculture',
      ministry: 'Ministry of Agriculture and Farmers Welfare',
      ministryHi: 'कृषि एवं किसान कल्याण मंत्रालय',
      ministryMr: 'कृषी आणि शेतकरी कल्याण मंत्रालय',
      department: 'Department of Agriculture, Cooperation and Farmers Welfare',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Land Ownership Documents / 7/12 Extract', 'Bank Account Passbook', 'Mobile Number']),
      applicationProcess: 'Register on the PM-Kisan portal, click on New Farmer Registration, fill out details, upload land documents, and submit.',
      applicationProcessHi: 'पीएम-किसान पोर्टल पर पंजीकरण करें, न्यू फार्मर रजिस्ट्रेशन पर क्लिक करें, विवरण भरें, भूमि दस्तावेज अपलोड करें और सबमिट करें।',
      applicationProcessMr: 'पीएम-किसान पोर्टलवर नोंदणी करा, न्यू फार्मर रजिस्ट्रेशनवर क्लिक करा, तपशील भरा, जमिनीची कागदपत्रे अपलोड करा आणि सबमिट करा.',
      officialUrl: 'https://pmkisan.gov.in/',
      infoUrl: 'https://pmkisan.gov.in/NewHome3.aspx',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Official PM-Kisan Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'isFarmer', operator: '==', value: true },
          { field: 'landOwned', operator: '>', value: 0.0 }
        ]
      }),
      ruleDescription: 'Must be a farmer owning agricultural land.'
    },
    {
      name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      nameHi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      nameMr: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
      description: 'The largest health assurance scheme in the world which aims to provide a health cover of ₹5 lakhs per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.',
      descriptionHi: 'दुनिया की सबसे बड़ी स्वास्थ्य आश्वासन योजना जिसका उद्देश्य 12 करोड़ से अधिक गरीब और कमजोर परिवारों को माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख का स्वास्थ्य कवर प्रदान करना है।',
      descriptionMr: 'जगातील सर्वात मोठी आरोग्य विमा योजना ज्याचा उद्देश १२ कोटींहून अधिक गरीब आणि असुरक्षित कुटुंबांना दुय्यम आणि तृतीयक उपचारांसाठी प्रति कुटुंब प्रति वर्ष ₹५ लाखांचे आरोग्य कवच प्रदान करणे आहे.',
      benefits: 'Cashless and paperless access to healthcare services up to ₹5,00,000 per family per year at empaneled hospitals.',
      benefitsHi: 'सूचीबद्ध अस्पतालों में प्रति परिवार प्रति वर्ष ₹5,00,000 तक की स्वास्थ्य सेवाओं के लिए कैशलेस और पेपरलेस पहुंच।',
      benefitsMr: 'सूचीबद्ध रुग्णालयांमध्ये प्रति कुटुंब प्रति वर्ष ₹५,००,००० पर्यंतच्या आरोग्य सेवांसाठी कॅशलेस आणि पेपरलेस प्रवेश.',
      category: 'Healthcare',
      ministry: 'Ministry of Health and Family Welfare',
      ministryHi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
      ministryMr: 'आरोग्य आणि कुटुंब कल्याण मंत्रालय',
      department: 'National Health Authority (NHA)',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Ration Card', 'Income Certificate', 'PM-JAY Letter / Golden Card']),
      applicationProcess: 'Check name in SECC-2011 database or PMJAY beneficiary list, visit nearest CSC or empaneled hospital, verify identity, and get Ayushman Card.',
      applicationProcessHi: 'एसईसीसी-2011 डेटाबेस या पीएमजेएवाई लाभार्थी सूची में नाम जांचें, निकटतम सीएससी या सूचीबद्ध अस्पताल पर जाएं, पहचान सत्यापित करें और आयुष्मान कार्ड प्राप्त करें।',
      applicationProcessMr: 'SECC-2011 डेटाबेस किंवा PMJAY लाभार्थी यादीत नाव तपासा, जवळच्या CSC किंवा सूचीबद्ध रुग्णालयाला भेट द्या, ओळख सत्यापित करा आणि आयुष्मान कार्ड मिळवा.',
      officialUrl: 'https://dashboard.pmjay.gov.in/',
      infoUrl: 'https://pmjay.gov.in/',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'National Health Authority Website',
      conditions: JSON.stringify({
        logical: 'OR',
        conditions: [
          { field: 'annualIncome', operator: '<=', value: 250000 },
          { field: 'isEws', operator: '==', value: true }
        ]
      }),
      ruleDescription: 'Family income must be ₹2.5 Lakhs or less, or must belong to EWS category.'
    },
    {
      name: 'Post Matric Scholarship Scheme for SC Students',
      nameHi: 'अनुसूचित जाति के छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति योजना',
      nameMr: 'अनुसूचित जातीच्या विद्यार्थ्यांसाठी पोस्ट मॅट्रिक शिष्यवृत्ती योजना',
      description: 'A scholarship scheme to provide financial assistance to Scheduled Caste students studying at post-matriculation or post-secondary stages to enable them to complete their education.',
      descriptionHi: 'अनुसूचित जाति के छात्रों को मैट्रिक के बाद या माध्यमिक शिक्षा के बाद के स्तर पर अध्ययन करने के लिए वित्तीय सहायता प्रदान करने की योजना ताकि वे अपनी शिक्षा पूरी कर सकें।',
      descriptionMr: 'अनुसूचित जातीच्या विद्यार्थ्यांना त्यांच्या उच्च शिक्षणासाठी आर्थिक मदत देण्याची शिष्यवृत्ती योजना जेणेकरून ते आपले शिक्षण पूर्ण करू शकतील.',
      benefits: 'Full tuition fee reimbursement and academic allowance up to ₹1,20,000 per year depending on the course.',
      benefitsHi: 'कोर्स के आधार पर प्रति वर्ष ₹1,20,000 तक का पूर्ण ट्यूशन शुल्क प्रतिपूर्ति और शैक्षणिक भत्ता।',
      benefitsMr: 'अभ्यासक्रमानुसार दरवर्षी ₹१,२०,००० पर्यंत पूर्ण शैक्षणिक शुल्क प्रतिपूर्ती आणि भत्ता.',
      category: 'Scholarships',
      ministry: 'Ministry of Social Justice and Empowerment',
      ministryHi: 'सामाजिक न्याय एवं अधिकारिता मंत्रालय',
      ministryMr: 'सामाजिक न्याय आणि सक्षमीकरण मंत्रालय',
      department: 'Department of Social Justice and Empowerment',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Caste Certificate', 'Income Certificate', 'Aadhaar Card', 'Mark Sheet of Last Examination', 'Fee Receipt of Current Course']),
      applicationProcess: 'Apply online on National Scholarship Portal (NSP), upload certificates, verify details through college nodal officer, and track status.',
      applicationProcessHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर ऑनलाइन आवेदन करें, प्रमाण पत्र अपलोड करें, कॉलेज नोडल अधिकारी के माध्यम से विवरण सत्यापित करें और स्थिति ट्रैक करें।',
      applicationProcessMr: 'राष्ट्रीय शिष्यवृत्ती पोर्टलवर (NSP) ऑनलाइन अर्ज करा, प्रमाणपत्रे अपलोड करा, कॉलेज नोडल अधिकाऱ्याद्वारे तपशील सत्यापित करा आणि स्थितीचा मागोवा घ्या.',
      officialUrl: 'https://scholarships.gov.in/',
      infoUrl: 'https://socialjustice.gov.in/schemes/112',
      deadline: '2026-10-31',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'National Scholarship Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'isStudent', operator: '==', value: true },
          { field: 'casteCategory', operator: '==', value: 'SC' },
          { field: 'annualIncome', operator: '<=', value: 250000 }
        ]
      }),
      ruleDescription: 'Must be a student, belong to SC category, and annual family income must be under ₹2.5 Lakhs.'
    },
    {
      name: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
      nameHi: 'प्रधानमंत्री आवास योजना - शहरी',
      nameMr: 'प्रधानमंत्री आवास योजना - शहरी',
      description: 'A flagship mission of Government of India implemented by the Ministry of Housing and Urban Affairs which addresses urban housing shortage among the EWS/LIG and MIG categories.',
      descriptionHi: 'भारत सरकार का एक प्रमुख मिशन जो शहरी गरीबों (EWS/LIG और MIG श्रेणियों) के बीच आवास की कमी को दूर करता है।',
      descriptionMr: 'भारत सरकारची एक प्रमुख योजना जी आर्थिकदृष्ट्या दुर्बल आणि अल्प उत्पन्न गटातील घटकांच्या शहरी गृहनिर्माण टंचाईचे निवारण करते.',
      benefits: 'Interest subsidy of up to 6.5% on home loans, or direct financial assistance of ₹1.5 Lakhs for home construction.',
      benefitsHi: 'गृह ऋण पर 6.5% तक की ब्याज सब्सिडी, या घर निर्माण के लिए ₹1.5 लाख की प्रत्यक्ष वित्तीय सहायता।',
      benefitsMr: 'गृहकर्जावर ६.५% पर्यंत व्याज सवलत, किंवा घर बांधणीसाठी ₹१.५ लाखांची थेट आर्थिक मदत.',
      category: 'Housing',
      ministry: 'Ministry of Housing and Urban Affairs',
      ministryHi: 'आवासन और शहरी कार्य मंत्रालय',
      ministryMr: 'गृहनिर्माण आणि शहरी व्यवहार मंत्रालय',
      department: 'Housing for All Division',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Identity Proof', 'Address Proof', 'Income Certificate', 'Affidavit stating no pucca house anywhere in India']),
      applicationProcess: 'Apply online on PMAY-U portal or through CSC, select the eligibility component, fill out personal details, submit income proofs, and register.',
      applicationProcessHi: 'पीएमएवाई-यू पोर्टल या सीएससी के माध्यम से ऑनलाइन आवेदन करें, पात्रता घटक का चयन करें, व्यक्तिगत विवरण भरें, आय प्रमाण पत्र जमा करें।',
      applicationProcessMr: 'PMAY-U पोर्टल किंवा CSC द्वारे ऑनलाइन अर्ज करा, पात्रता घटक निवडा, वैयक्तिक तपशील भरा, आय प्रमाणपत्र सादर करा.',
      officialUrl: 'https://pmay-urban.gov.in/',
      infoUrl: 'https://pmaymis.gov.in/',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'PMAY-U Official Site',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'areaType', operator: '==', value: 'Urban' },
          { field: 'annualIncome', operator: '<=', value: 600000 },
          { field: 'housingStatus', operator: '==', value: 'Rented' }
        ]
      }),
      ruleDescription: 'Must live in an Urban area, have annual family income under ₹6 Lakhs, and currently reside in a rented house.'
    },
    {
      name: 'Pradhan Mantri Ujjwala Yojana (PMUY) 2.0',
      nameHi: 'प्रधानमंत्री उज्ज्वला योजना २.०',
      nameMr: 'प्रधानमंत्री उज्ज्वला योजना २.०',
      description: 'A scheme to release deposit-free LPG connections to women from poor households who do not have an LPG connection in their household.',
      descriptionHi: 'गरीब परिवारों की उन महिलाओं को जमा-मुक्त एलपीजी कनेक्शन प्रदान करने की योजना जिनके घर में एलपीजी कनेक्शन नहीं है।',
      descriptionMr: 'घरात एलपीजी कनेक्शन नसलेल्या गरीब कुटुंबातील महिलांना ठेवमुक्त एलपीजी कनेक्शन देण्याची योजना.',
      benefits: 'Free LPG connection, first cylinder free of cost, and hot plate stove support along with EMI options.',
      benefitsHi: 'निःशुल्क एलपीजी कनेक्शन, पहला सिलेंडर मुफ्त, और ईएमआई विकल्पों के साथ हॉट प्लेट स्टोव सहायता।',
      benefitsMr: 'मोफत एलपीजी कनेक्शन, पहिला सिलिंडर मोफत आणि ईएमआय पर्यायांसह गॅस शेगडी मदत.',
      category: 'Women & Child',
      ministry: 'Ministry of Petroleum and Natural Gas',
      ministryHi: 'पेट्रोलियम और प्राकृतिक गैस मंत्रालय',
      ministryMr: 'पेट्रोलियम आणि नैसर्गिक वायू मंत्रालय',
      department: 'LPG Division',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card of Applicant', 'Aadhaar of adult family members', 'Ration Card issued by State Govt', 'Bank Account Passbook', 'BPL Certificate']),
      applicationProcess: 'Apply online through the PMUY website or physically at the local LPG distributor, fill details, and verify documents.',
      applicationProcessHi: 'पीएमयूवाई वेबसाइट के माध्यम से ऑनलाइन आवेदन करें या स्थानीय एलपीजी वितरक के पास जाकर फॉर्म भरें और दस्तावेज सत्यापित करें।',
      applicationProcessMr: 'PMUY वेबसाइटद्वारे ऑनलाइन अर्ज करा किंवा स्थानिक एलपीजी वितरकाकडे जाऊन अर्ज भरा आणि कागदपत्रे सत्यापित करा.',
      officialUrl: 'https://www.pmuy.gov.in/',
      infoUrl: 'https://www.pmuy.gov.in/ujjwala2.html',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Ministry of Petroleum and Natural Gas',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'gender', operator: '==', value: 'Female' },
          { field: 'age', operator: '>=', value: 18 },
          { field: 'annualIncome', operator: '<=', value: 200000 }
        ]
      }),
      ruleDescription: 'Applicant must be a female of at least 18 years, and annual family income must be under ₹2 Lakhs.'
    },
    {
      name: 'Pradhan Mantri Mudra Yojana (PMMY)',
      nameHi: 'प्रधानमंत्री मुद्रा योजना',
      nameMr: 'प्रधानमंत्री मुद्रा योजना',
      description: 'A scheme to provide collateral-free loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises. These loans are classified as Shishu, Kishor and Tarun.',
      descriptionHi: 'गैर-कॉर्पोरेट, गैर-कृषि लघु/सूक्ष्म उद्यमों को ₹10 लाख तक के बिना गारंटी ऋण प्रदान करने की योजना। इन ऋणों को शिशु, किशोर और तरुण में वर्गीकृत किया गया है।',
      descriptionMr: 'गैर-कॉर्पोरेट, बिगरशेती लघु/सूक्ष्म उपक्रमांना ₹१० लाखांपर्यंतचे तारणमुक्त कर्ज देण्याची योजना. या कर्जांचे शिशु, किशोर आणि तरुण असे वर्गीकरण केले आहे.',
      benefits: 'Collateral-free business loans up to ₹10 Lakhs with flexible repayment terms and low interest rates.',
      benefitsHi: 'लचीली पुनर्भुगतान शर्तों और कम ब्याज दरों के साथ ₹10 लाख तक का संपार्श्विक-मुक्त व्यावसायिक ऋण।',
      benefitsMr: 'लवचिक परतफेड अटी आणि कमी व्याजदरांसह ₹१० लाखांपर्यंतचे तारणमुक्त व्यावसायिक कर्ज.',
      category: 'Entrepreneurship',
      ministry: 'Ministry of Finance',
      ministryHi: 'वित्त मंत्रालय',
      ministryMr: 'वित्त मंत्रालय',
      department: 'Department of Financial Services',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Identity Proof', 'Address Proof', 'Business Address Proof', 'Quotations / Project Report', 'Category Certificate (if applicable)']),
      applicationProcess: 'Apply online through Udyam Mitra portal or visit any public/private commercial bank, submit business proposal, and get approval.',
      applicationProcessHi: 'उद्यम मित्र पोर्टल के माध्यम से ऑनलाइन आवेदन करें या किसी भी सार्वजनिक/निजी वाणिज्यिक बैंक में जाएं, व्यापार प्रस्ताव जमा करें।',
      applicationProcessMr: 'उद्यम मित्र पोर्टलद्वारे ऑनलाइन अर्ज करा किंवा कोणत्याही सार्वजनिक/खाजगी बँकेला भेट द्या, व्यवसाय प्रस्ताव सादर करा.',
      officialUrl: 'https://www.mudra.org.in/',
      infoUrl: 'https://www.mudra.org.in/Home/PMMYDescription',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'MUDRA Official website',
      conditions: JSON.stringify({
        logical: 'OR',
        conditions: [
          { field: 'employmentStatus', operator: '==', value: 'Self-Employed' },
          { field: 'occupation', operator: '==', value: 'Business' }
        ]
      }),
      ruleDescription: 'Must be self-employed or engaged in business operations.'
    },
    {
      name: 'Atal Pension Yojana (APY)',
      nameHi: 'अटल पेंशन योजना',
      nameMr: 'अटल पेन्शन योजना',
      description: 'A pension scheme focused on the unorganized sector workers, providing a guaranteed minimum pension of ₹1,000 to ₹5,000 per month after the age of 60 years.',
      descriptionHi: 'असंगठित क्षेत्र के श्रमिकों पर केंद्रित एक पेंशन योजना, जो 60 वर्ष की आयु के बाद प्रति माह ₹1,000 से ₹5,000 की गारंटीकृत न्यूनतम पेंशन प्रदान करती है।',
      descriptionMr: 'असंघटित क्षेत्रातील कामगारांवर केंद्रित पेन्शन योजना, वयाच्या ६० वर्षांनंतर दरमहा ₹१,००० ते ₹५,००० ची हमी देणारी पेन्शन प्रदान करते.',
      benefits: 'Guaranteed pension ranging from ₹1,000 to ₹5,000 per month from the age of 60, based on the contribution amount.',
      benefitsHi: 'योगदान राशि के आधार पर 60 वर्ष की आयु से प्रति माह ₹1,000 से ₹5,000 तक की गारंटीकृत पेंशन।',
      benefitsMr: 'योगदानाच्या रकमेवर आधारित वयाच्या ६० व्या वर्षापासून दरमहा ₹१,००० ते ₹५,००० पर्यंतची हमी पेन्शन.',
      category: 'Pension',
      ministry: 'Ministry of Finance',
      ministryHi: 'वित्त मंत्रालय',
      ministryMr: 'वित्त मंत्रालय',
      department: 'Pension Fund Regulatory and Development Authority (PFRDA)',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Savings Bank Account', 'Mobile Number', 'Consent Form for Auto-debit']),
      applicationProcess: 'Visit the bank branch where you hold a savings account, fill the APY registration form, choose pension slab, and enable auto-debit.',
      applicationProcessHi: 'उस बैंक शाखा में जाएं जहां आपका बचत खाता है, एपीवाई पंजीकरण फॉर्म भरें, पेंशन स्लैब चुनें और ऑटो-डेबिट सक्षम करें।',
      applicationProcessMr: 'ज्या बँकेत तुमचे बचत खाते आहे त्या बँकेच्या शाखेला भेट द्या, APY नोंदणी अर्ज भरा, पेन्शन स्लॅब निवडा आणि ऑटो-डेबिट सुरू करा.',
      officialUrl: 'https://www.npscra.nsdl.co.in/scheme-details.php',
      infoUrl: 'https://www.npscra.nsdl.co.in/',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'PFRDA Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 18 },
          { field: 'age', operator: '<=', value: 40 }
        ]
      }),
      ruleDescription: 'Must be between 18 and 40 years of age.'
    },
    {
      name: 'National Means cum Merit Scholarship (NMMSS)',
      nameHi: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति',
      nameMr: 'राष्ट्रीय साधन-सह-योग्यता शिष्यवृत्ती',
      description: 'A scholarship scheme for meritorious students of economically weaker sections to arrest their drop out at class VIII and encourage them to continue studies.',
      descriptionHi: 'आर्थिक रूप से कमजोर वर्गों के मेधावी छात्रों के लिए छात्रवृत्ति योजना ताकि कक्षा VIII में उनकी पढ़ाई छूटने से रोकी जा सके और उन्हें पढ़ाई जारी रखने के लिए प्रोत्साहित किया जा सके।',
      descriptionMr: 'आर्थिकदृष्ट्या दुर्बल घटकातील गुणवंत विद्यार्थ्यांसाठी शिष्यवृत्ती योजना जेणेकरून इयत्ता ८ वी मधील त्यांची गळती रोखता येईल आणि शिक्षण सुरू ठेवण्यास प्रोत्साहन मिळेल.',
      benefits: 'Scholarship amount of ₹12,000 per annum (₹1,000 per month) for studying from class IX to XII in government/aided schools.',
      benefitsHi: 'सरकारी/सहायता प्राप्त स्कूलों में कक्षा IX से XII तक पढ़ने के लिए ₹12,000 प्रति वर्ष (₹1,000 प्रति माह) की छात्रवृत्ति।',
      benefitsMr: 'शासकीय/अनुदानित शाळांमध्ये इयत्ता ९ वी ते १२ वी मध्ये शिकण्यासाठी दरवर्षी ₹१२,००० (दरमहा ₹१,०००) शिष्यवृत्ती रक्कम.',
      category: 'Scholarships',
      ministry: 'Ministry of Education',
      ministryHi: 'शिक्षा मंत्रालय',
      ministryMr: 'शिक्षण मंत्रालय',
      department: 'Department of School Education and Literacy',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Class 7th Mark Sheet', 'Income Certificate', 'Caste Certificate (if applicable)', 'Disability Certificate (if applicable)']),
      applicationProcess: 'Register and apply on National Scholarship Portal (NSP), pass the state level written examination, verify school enrollment details.',
      applicationProcessHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर पंजीकरण और आवेदन करें, राज्य स्तरीय लिखित परीक्षा पास करें, स्कूल नामांकन विवरण सत्यापित करें।',
      applicationProcessMr: 'राष्ट्रीय शिष्यवृत्ती पोर्टलवर (NSP) नोंदणी आणि अर्ज करा, राज्य पातळीवरील लेखी परीक्षा उत्तीर्ण व्हा, शाळा नोंदणी तपशील सत्यापित करा.',
      officialUrl: 'https://scholarships.gov.in/',
      infoUrl: 'https://www.education.gov.in/en/nmms',
      deadline: '2026-11-15',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'National Scholarship Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'isStudent', operator: '==', value: true },
          { field: 'annualIncome', operator: '<=', value: 350000 },
          { field: 'education', operator: 'IN', value: ['Below 10th', '10th'] }
        ]
      }),
      ruleDescription: 'Must be a student in class 8th/9th/10th and family income under ₹3.5 Lakhs.'
    },
    {
      name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
      nameHi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना',
      nameMr: 'प्रधानमंत्री जीवन ज्योती विमा योजना',
      description: 'A one-year life insurance scheme renewable from year to year offering coverage for death due to any reason to saving bank account holders.',
      descriptionHi: 'एक साल की जीवन बीमा योजना जो साल-दर-साल नवीकरणीय है और बचत बैंक खाताधारकों को किसी भी कारण से मृत्यु होने पर कवरेज प्रदान करती है।',
      descriptionMr: 'बचत बँक खातेदारांना कोणत्याही कारणास्तव मृत्यू झाल्यास संरक्षण देणारी, वर्षानुवर्षे नूतनीकरण करण्यायोग्य एक वर्षाची जीवन विमा योजना.',
      benefits: 'Life cover of ₹2,00,000 in case of death of the insured due to any reason, for a premium of ₹436 per annum.',
      benefitsHi: 'बीमाधारक की किसी भी कारण से मृत्यु होने पर ₹2,00,000 का जीवन बीमा कवर, प्रति वर्ष ₹436 के प्रीमियम पर।',
      benefitsMr: 'विमाधारकाचा कोणत्याही कारणाने मृत्यू झाल्यास ₹२,००,००० चे जीवन संरक्षण, दरवर्षी ₹४३६ प्रीमियमवर.',
      category: 'Social Security',
      ministry: 'Ministry of Finance',
      ministryHi: 'वित्त मंत्रालय',
      ministryMr: 'वित्त मंत्रालय',
      department: 'Department of Financial Services',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Bank Passbook', 'Consent Form for Auto-debit', 'Nominee details']),
      applicationProcess: 'Link bank account, submit PMJJBY application form with auto-debit consent, and verify registration status in your bank application.',
      applicationProcessHi: 'बैंक खाते को लिंक करें, ऑटो-डेबिट सहमति के साथ पीएमजेजेबीवाई आवेदन पत्र जमा करें, अपने बैंक में पंजीकरण स्थिति जांचें।',
      applicationProcessMr: 'बँक खाते लिंक करा, ऑटो-डेबिट संमतीसह PMJJBY अर्ज सादर करा आणि तुमच्या बँकेत नोंदणीची स्थिती तपासा.',
      officialUrl: 'https://www.jansuraksha.gov.in/',
      infoUrl: 'https://www.jansuraksha.gov.in/Rules.aspx',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Jan Suraksha Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 18 },
          { field: 'age', operator: '<=', value: 50 }
        ]
      }),
      ruleDescription: 'Must be between 18 and 50 years of age and hold a savings bank account.'
    },
    {
      name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
      nameHi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
      nameMr: 'प्रधानमंत्री सुरक्षा विमा योजना',
      description: 'A one-year accidental insurance scheme offering coverage for accidental death and full or partial disability to bank account holders.',
      descriptionHi: 'एक साल की दुर्घटना बीमा योजना जो बचत बैंक खाताधारकों को दुर्घटना के कारण मृत्यु और पूर्ण या आंशिक विकलांगता के लिए कवरेज प्रदान करती है।',
      descriptionMr: 'बँक खातेदारांना अपघाती मृत्यू आणि पूर्ण किंवा आंशिक अपंगत्वासाठी संरक्षण देणारी एक वर्षाची अपघात विमा योजना.',
      benefits: 'Accidental death cover of ₹2 Lakhs, permanent total disability cover of ₹2 Lakhs, and permanent partial disability cover of ₹1 Lakh for a premium of ₹20 per annum.',
      benefitsHi: 'प्रति वर्ष ₹20 के प्रीमियम पर अपघाती मृत्यु के लिए ₹2 लाख, स्थायी पूर्ण विकलांगता के लिए ₹2 लाख और आंशिक विकलांगता के लिए ₹1 लाख का कवर।',
      benefitsMr: 'अपघाती मृत्यूसाठी ₹२ लाख, कायमचे पूर्ण अपंगत्व यासाठी ₹२ लाख आणि अंशतः अपंगत्वासाठी ₹१ लाख संरक्षण, दरवर्षी ₹२० प्रीमियमवर.',
      category: 'Social Security',
      ministry: 'Ministry of Finance',
      ministryHi: 'वित्त मंत्रालय',
      ministryMr: 'वित्त मंत्रालय',
      department: 'Department of Financial Services',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Savings Bank Passbook', 'Consent Form for Auto-debit']),
      applicationProcess: 'Submit enrollment form to saving bank account branch with auto-debit option checked, verify subscription status.',
      applicationProcessHi: 'ऑटो-डेबिट विकल्प के साथ बचत बैंक खाता शाखा में नामांकन फॉर्म जमा करें, अपनी सदस्यता स्थिति सत्यापित करें।',
      applicationProcessMr: 'ऑटो-डेबिट पर्यायासह बचत बँक खात्याच्या शाखेत नावनोंदणी अर्ज सादर करा, सदस्यत्वाची स्थिती सत्यापित करा.',
      officialUrl: 'https://www.jansuraksha.gov.in/',
      infoUrl: 'https://www.jansuraksha.gov.in/Rules.aspx',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Jan Suraksha Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 18 },
          { field: 'age', operator: '<=', value: 70 }
        ]
      }),
      ruleDescription: 'Must be between 18 and 70 years of age.'
    },
    {
      name: 'Credit Guarantee Scheme for Micro and Small Enterprises (CGTMSE)',
      nameHi: 'सूक्ष्म एवं लघु उद्यमों के लिए क्रेडिट गारंटी योजना',
      nameMr: 'सूक्ष्म आणि लघु उद्योगांसाठी क्रेडिट गॅरंटी योजना',
      description: 'A scheme to make available collateral-free credit to the micro and small enterprise sector from lending institutions.',
      descriptionHi: 'ऋणदाता संस्थानों से सूक्ष्म और लघु उद्यम क्षेत्र को संपार्श्विक-मुक्त ऋण उपलब्ध कराने की योजना।',
      descriptionMr: 'कर्ज देणाऱ्या संस्थांकडून सूक्ष्म आणि लघु उद्योग क्षेत्राला तारणमुक्त कर्ज उपलब्ध करून देण्याची योजना.',
      benefits: 'Credit guarantee cover for third-party guarantees and collateral-free business loans up to ₹5 Crores for micro and small units.',
      benefitsHi: 'सूक्ष्म और लघु इकाइयों के लिए तीसरे पक्ष की गारंटी और ₹5 करोड़ तक के बिना गारंटी ऋण के लिए क्रेडिट गारंटी कवर।',
      benefitsMr: 'तिसऱ्या पक्षाच्या हमीसाठी क्रेडिट गॅरंटी संरक्षण आणि सूक्ष्म आणि लघु घटकांसाठी ₹५ कोटींपर्यंत तारणमुक्त व्यावसायिक कर्ज.',
      category: 'MSME',
      ministry: 'Ministry of Micro, Small and Medium Enterprises',
      ministryHi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      ministryMr: 'सूक्ष्म, लघु आणि मध्यम उद्योग मंत्रालय',
      department: 'CGTMSE Trust',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Udyam Registration Certificate', 'Detailed Project Report (DPR)', 'IT Returns & Balance Sheet', 'Incorporation Certificate']),
      applicationProcess: 'Apply for loan in CGTMSE member banks/FIs, banks register the project with CGTMSE trust for guarantee coverage.',
      applicationProcessHi: 'CGTMSE सदस्य बैंकों/वित्तीय संस्थानों में ऋण के लिए आवेदन करें, बैंक गारंटी कवरेज के लिए परियोजना को पंजीकृत करते हैं।',
      applicationProcessMr: 'CGTMSE सदस्य बँका/वित्तीय संस्थांमध्ये कर्जासाठी अर्ज करा, बँक प्रकल्पाची हमी संरक्षणासाठी नोंदणी करतात.',
      officialUrl: 'https://www.cgtmse.in/',
      infoUrl: 'https://www.cgtmse.in/About-us',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'CGTMSE Website',
      conditions: JSON.stringify({
        logical: 'OR',
        conditions: [
          { field: 'employmentStatus', operator: '==', value: 'Self-Employed' },
          { field: 'occupation', operator: '==', value: 'Business' }
        ]
      }),
      ruleDescription: 'Applicant must be an entrepreneur/business owner running an MSME.'
    },
    {
      name: 'Sanjay Gandhi Niradhar Anudan Yojana',
      nameHi: 'संजय गांधी निराधार अनुदान योजना',
      nameMr: 'संजय गांधी निराधार अनुदान योजना',
      description: 'A Maharashtra state scheme providing monthly financial assistance to destitute persons, blind, disabled, and people suffering from major illnesses.',
      descriptionHi: 'महाराष्ट्र सरकार की योजना जो बेसहारा व्यक्तियों, नेत्रहीनों, विकलांगों और गंभीर बीमारियों से पीड़ित लोगों को मासिक वित्तीय सहायता प्रदान करती है।',
      descriptionMr: 'निराधार व्यक्ती, अंध, अपंग आणि गंभीर आजारांनी ग्रस्त असलेल्या लोकांना मासिक आर्थिक मदत देणारी महाराष्ट्र राज्य सरकारची योजना.',
      benefits: 'Monthly financial assistance of ₹1,500 for eligible beneficiaries.',
      benefitsHi: 'पात्र लाभार्थियों के लिए ₹1,500 की मासिक वित्तीय सहायता।',
      benefitsMr: 'पात्र लाभार्थ्यांसाठी दरमहा ₹१,५०० ची आर्थिक मदत.',
      category: 'Social Security',
      ministry: 'Social Justice and Special Assistance Department',
      ministryHi: 'सामाजिक न्याय एवं विशेष सहायता विभाग',
      ministryMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
      department: 'Divisional Commissioner / District Collectorate',
      isCentral: false,
      state: 'Maharashtra',
      documents: JSON.stringify(['Age Proof', 'Income Certificate (under ₹50,000)', 'Disability Certificate (if applicable)', 'Domicile Certificate of Maharashtra']),
      applicationProcess: 'Collect application form from Tahsildar office, fill details, attach income and disability certificates, and submit to Nayab Tahsildar.',
      applicationProcessHi: 'तहसीलदार कार्यालय से आवेदन पत्र प्राप्त करें, विवरण भरें, आय और विकलांगता प्रमाण पत्र संलग्न करें और जमा करें।',
      applicationProcessMr: 'तहसीलदार कार्यालयातून अर्ज घ्या, तपशील भरा, उत्पन्न आणि अपंगत्व प्रमाणपत्रे जोडून नायब तहसीलदारांकडे सादर करा.',
      officialUrl: 'https://sjsa.maharashtra.gov.in/',
      infoUrl: 'https://mahasarkar.co.in/sanjay-gandhi-niradhar-anudan-yojana/',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Maharashtra Government Website',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'state', operator: '==', value: 'Maharashtra' },
          { field: 'annualIncome', operator: '<=', value: 50000 },
          {
            logical: 'OR',
            conditions: [
              { field: 'isDifferentlyAbled', operator: '==', value: true },
              { field: 'age', operator: '>=', value: 65 }
            ]
          }
        ]
      }),
      ruleDescription: 'Must reside in Maharashtra, annual income under ₹50,000, and must be either disabled or senior citizen (65+).'
    },
    {
      name: 'Madhya Pradesh Mukhyamantri Ladli Behna Yojana',
      nameHi: 'मध्य प्रदेश मुख्यमंत्री लाड़ली बहना योजना',
      nameMr: 'मध्य प्रदेश मुख्यमंत्री लाडली बहना योजना',
      description: 'A Madhya Pradesh state scheme targeting women empowerment by transferring financial aid monthly to support their nutrition and health status.',
      descriptionHi: 'मध्य प्रदेश सरकार की योजना जो महिलाओं के पोषण और स्वास्थ्य स्थिति में सुधार के लिए उन्हें मासिक वित्तीय सहायता प्रदान करती है।',
      descriptionMr: 'महिलांचे पोषण आणि आरोग्य सुधारण्यासाठी त्यांना मासिक आर्थिक मदत देणारी मध्य प्रदेश सरकारची योजना.',
      benefits: 'Monthly direct benefit transfer of ₹1,250 to bank accounts of registered married women.',
      benefitsHi: 'पंजीकृत विवाहित महिलाओं के बैंक खातों में प्रति माह ₹1,250 का प्रत्यक्ष लाभ हस्तांतरण।',
      benefitsMr: 'नोंदणीकृत विवाहित महिलांच्या बँक खात्यात दरमहा ₹१,२५० चे थेट लाभ हस्तांतरण.',
      category: 'Women & Child',
      ministry: 'Department of Women and Child Development',
      ministryHi: 'महिला एवं बाल विकास विभाग',
      ministryMr: 'महिला व बाल विकास विभाग',
      department: 'WCD Madhya Pradesh',
      isCentral: false,
      state: 'Madhya Pradesh',
      documents: JSON.stringify(['Samagra ID', 'Aadhaar Card', 'Ration Card', 'Mobile Number linked with Samagra']),
      applicationProcess: 'Apply through local ward offices or Gram Panchayat camp sites, fill registration form, take live photo, and verify e-KYC.',
      applicationProcessHi: 'स्थानीय वार्ड कार्यालयों या ग्राम पंचायत शिविरों के माध्यम से आवेदन करें, पंजीकरण फॉर्म भरें, लाइव फोटो लें।',
      applicationProcessMr: 'स्थानिक प्रभाग कार्यालये किंवा ग्रामपंचायत शिबिरांद्वारे अर्ज करा, नोंदणी अर्ज भरा, थेट फोटो घ्या.',
      officialUrl: 'https://cmladlibahna.mp.gov.in/',
      infoUrl: 'https://cmladlibahna.mp.gov.in/aboutus.aspx',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'MP Government Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'state', operator: '==', value: 'Madhya Pradesh' },
          { field: 'gender', operator: '==', value: 'Female' },
          { field: 'age', operator: '>=', value: 21 },
          { field: 'age', operator: '<=', value: 60 },
          { field: 'annualIncome', operator: '<=', value: 250000 }
        ]
      }),
      ruleDescription: 'Must live in Madhya Pradesh, be female between 21 and 60 years, and have family income under ₹2.5 Lakhs.'
    },
    {
      name: 'Namo Shetkari Mahasanman Nidhi Yojana',
      nameHi: 'नमो शेतकरी महासन्मान निधी योजना',
      nameMr: 'नमो शेतकरी महासन्मान निधी योजना',
      description: 'A Maharashtra government initiative to provide additional financial assistance to farmers, mirroring the central PM-Kisan scheme.',
      descriptionHi: 'महाराष्ट्र सरकार की एक पहल जिसका उद्देश्य किसानों को अतिरिक्त वित्तीय सहायता प्रदान करना है, जो केंद्रीय पीएम-किसान योजना के पूरक के रूप में काम करती है।',
      descriptionMr: 'शेतकऱ्यांना अतिरिक्त आर्थिक मदत देण्याचा महाराष्ट्र सरकारचा उपक्रम, जो केंद्रीय पीएम-किसान योजनेला पूरक म्हणून काम करतो.',
      benefits: 'An additional financial benefit of ₹6,000 per year (cumulative with PM-Kisan, totaling ₹12,000 per year for Maharashtra farmers).',
      benefitsHi: 'प्रति वर्ष ₹6,000 का अतिरिक्त वित्तीय लाभ (पीएम-किसान के साथ मिलकर कुल ₹12,000 प्रति वर्ष)।',
      benefitsMr: 'दरवर्षी ₹६,००० चा अतिरिक्त आर्थिक लाभ (पीएम-किसान सोबत मिळून दरवर्षी एकूण ₹१२,०००).',
      category: 'Agriculture',
      ministry: 'Agriculture Department, Maharashtra',
      ministryHi: 'कृषि विभाग, महाराष्ट्र',
      ministryMr: 'कृषी विभाग, महाराष्ट्र',
      department: 'Department of Agriculture',
      isCentral: false,
      state: 'Maharashtra',
      documents: JSON.stringify(['PM-Kisan Registration Number', 'Aadhaar Card', 'Land Ownership (7/12 Extract)', 'Bank Account Details']),
      applicationProcess: 'Beneficiaries registered under PM-Kisan in Maharashtra are automatically enrolled. Unregistered farmers can apply on MahaDBT portal.',
      applicationProcessHi: 'महाराष्ट्र में पीएम-किसान के तहत पंजीकृत लाभार्थी स्वचालित रूप से नामांकित हो जाते हैं। अन्य महाडीबीटी पोर्टल पर आवेदन कर सकते हैं।',
      applicationProcessMr: 'महाराष्ट्रात पीएम-किसान अंतर्गत नोंदणीकृत लाभार्थी आपोआप पात्र ठरतात. इतर महाडीबीटी पोर्टलवर अर्ज करू शकतात.',
      officialUrl: 'https://mahadbt.maharashtra.gov.in/',
      infoUrl: 'https://krishi.maharashtra.gov.in/',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'MahaDBT Agriculture Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'state', operator: '==', value: 'Maharashtra' },
          { field: 'isFarmer', operator: '==', value: true },
          { field: 'landOwned', operator: '>', value: 0.0 }
        ]
      }),
      ruleDescription: 'Must reside in Maharashtra, be a farmer, and own agricultural land.'
    },
    {
      name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
      nameHi: 'प्रधानमंत्री श्रम योगी मान-धन',
      nameMr: 'प्रधानमंत्री श्रम योगी मान-धन',
      description: 'A voluntary and contributory pension scheme for unorganized workers like street vendors, rickshaw pullers, domestic workers, etc. for old age protection.',
      descriptionHi: 'असंगठित श्रमिकों (जैसे रेहड़ी-पटरी वालों, रिक्शा चालकों, घरेलू कामगारों) के लिए वृद्धावस्था सुरक्षा के लिए एक स्वैच्छिक और अंशदायी पेंशन योजना।',
      descriptionMr: 'असंघटित कामगारांसाठी (जसे की फेरीवाले, रिक्षाचालक, घरगुती कामगार) वृद्धापकाळ संरक्षणासाठी एक स्वैच्छिक आणि अंशदायी पेन्शन योजना.',
      benefits: 'Assured monthly pension of ₹3,000 after attaining the age of 60 years.',
      benefitsHi: '60 वर्ष की आयु प्राप्त करने के बाद ₹3,000 की सुनिश्चित मासिक पेंशन।',
      benefitsMr: 'वयाची ६० वर्षे पूर्ण झाल्यानंतर ₹३,००० ची खात्रीशीर मासिक पेन्शन.',
      category: 'Pension',
      ministry: 'Ministry of Labour and Employment',
      ministryHi: 'श्रम एवं रोजगार मंत्रालय',
      ministryMr: 'कामगार आणि रोजगार मंत्रालय',
      department: 'Unorganised Workers Division',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Savings Bank Account Passbook', 'Mobile Number', 'Self-Declaration Form']),
      applicationProcess: 'Visit nearest Common Service Center (CSC), enroll using Aadhaar Card and Savings Bank Account, and pay first contribution in cash.',
      applicationProcessHi: 'निकटतम सामान्य सेवा केंद्र (सीएससी) पर जाएं, आधार कार्ड और बचत बैंक खाते का उपयोग करके नामांकन करें, पहली किस्त नकद भुगतान करें।',
      applicationProcessMr: 'जवळच्या सामान्य सेवा केंद्राला (CSC) भेट द्या, आधार कार्ड आणि बचत बँक खात्याचा वापर करून नोंदणी करा.',
      officialUrl: 'https://maandhan.in/',
      infoUrl: 'https://www.labour.gov.in/pm-sym',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Maan-dhan Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 18 },
          { field: 'age', operator: '<=', value: 40 },
          { field: 'annualIncome', operator: '<=', value: 180000 },
          { field: 'employmentStatus', operator: '!=', value: 'Salaried' }
        ]
      }),
      ruleDescription: 'Must be between 18 and 40 years of age, monthly income under ₹15,000 (annual ₹1.8L), and not a salaried corporate employee.'
    },
    {
      name: 'National Social Assistance Programme (NSAP) - IGNOAPS',
      nameHi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना',
      nameMr: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेन्शन योजना',
      description: 'A central pension scheme providing financial assistance to senior citizens belonging to households below the poverty line.',
      descriptionHi: 'गरीबी रेखा से नीचे के परिवारों से संबंधित वरिष्ठ नागरिकों को वित्तीय सहायता प्रदान करने वाली एक केंद्रीय पेंशन योजना।',
      descriptionMr: 'दारिद्र्यरेषेखालील कुटुंबातील वरिष्ठ नागरिकांना आर्थिक मदत देणारी केंद्रीय पेन्शन योजना.',
      benefits: 'Monthly pension of ₹200 for ages 60-79, and ₹500 per month for senior citizens of age 80 years and above.',
      benefitsHi: '60-79 वर्ष की आयु के लिए ₹200 प्रति माह, और 80 वर्ष या उससे अधिक आयु के वरिष्ठ नागरिकों के लिए ₹500 प्रति माह।',
      benefitsMr: '६०-७९ वयोगटासाठी दरमहा ₹२०० आणि ८० वर्षे किंवा त्याहून अधिक वयाच्या वरिष्ठ नागरिकांसाठी दरमहा ₹५०० पेन्शन.',
      category: 'Pension',
      ministry: 'Ministry of Rural Development',
      ministryHi: 'ग्रामीण विकास मंत्रालय',
      ministryMr: 'ग्रामीण विकास मंत्रालय',
      department: 'NSAP Division',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Age Proof Certificate', 'BPL Ration Card', 'Aadhaar Card', 'Bank Passbook']),
      applicationProcess: 'Apply through Social Welfare Department or Block Development Office (BDO) in rural areas, or Municipality in urban areas.',
      applicationProcessHi: 'ग्रामीण क्षेत्रों में समाज कल्याण विभाग या ब्लॉक विकास कार्यालय (BDO) और शहरी क्षेत्रों में नगर पालिका के माध्यम से आवेदन करें।',
      applicationProcessMr: 'ग्रामीण भागात समाजकल्याण विभाग किंवा गटविकास कार्यालय (BDO) आणि शहरी भागात नगरपालिकेद्वारे अर्ज करा.',
      officialUrl: 'https://nsap.nic.in/',
      infoUrl: 'https://nsap.nic.in/guidelines.html',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'NSAP Government website',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 60 },
          { field: 'isEws', operator: '==', value: true }
        ]
      }),
      ruleDescription: 'Must be at least 60 years of age and hold BPL/EWS status.'
    },
    {
      name: 'PM Vidyalaxmi Student Loan Scheme (Demo Representative)',
      nameHi: 'पीएम विद्यालक्ष्मी छात्र ऋण योजना',
      nameMr: 'पीएम विद्यालक्ष्मी शैक्षणिक कर्ज योजना',
      description: 'A portal for students seeking education loans, providing access to multiple banks and education loan schemes with interest subsidy support for poor students.',
      descriptionHi: 'शिक्षा ऋण चाहने वाले छात्रों के लिए एक पोर्टल, जो गरीब छात्रों के लिए ब्याज सब्सिडी सहायता के साथ कई बैंकों और शिक्षा ऋण योजनाओं तक पहुंच प्रदान करता है।',
      descriptionMr: 'शैक्षणिक कर्ज शोधत असलेल्या विद्यार्थ्यांसाठी एक पोर्टल, जे गरीब विद्यार्थ्यांसाठी व्याज सवलत मदतीसह अनेक बँका आणि शैक्षणिक कर्ज योजनांमध्ये प्रवेश प्रदान करते.',
      benefits: 'Interest-subsidized education loans up to ₹7.5 Lakhs without collateral for higher studies in India.',
      benefitsHi: 'भारत में उच्च शिक्षा के लिए बिना गारंटी के ₹7.5 लाख तक का ब्याज-सब्सिडी वाला शिक्षा ऋण।',
      benefitsMr: 'भारतात उच्च शिक्षणासाठी तारण विना ₹७.५ लाखांपर्यंतचे व्याज सवलतीसह शैक्षणिक कर्ज.',
      category: 'Education',
      ministry: 'Ministry of Finance',
      ministryHi: 'वित्त मंत्रालय',
      ministryMr: 'वित्त मंत्रालय',
      department: 'Department of Financial Services / Higher Education',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Proof of Admission', 'Fee Structure Sheet', 'Mark Sheet of 10th & 12th', 'Income Certificate']),
      applicationProcess: 'Register on Vidya Lakshmi portal, fill Common Education Loan Application Form (CELAF), search and apply to preferred banks.',
      applicationProcessHi: 'विद्या लक्ष्मी पोर्टल पर पंजीकरण करें, कॉमन एजुकेशन लोन एप्लीकेशन फॉर्म (CELAF) भरें, पसंदीदा बैंकों में आवेदन करें।',
      applicationProcessMr: 'विद्या लक्ष्मी पोर्टलवर नोंदणी करा, कॉमन एज्युकेशन लोन ॲप्लिकेशन फॉर्म (CELAF) भरा, बँकांमध्ये अर्ज करा.',
      officialUrl: 'https://www.vidyalakshmi.co.in/',
      infoUrl: 'https://www.vidyalakshmi.co.in/Students/about-us',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Vidya Lakshmi Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'isStudent', operator: '==', value: true },
          { field: 'annualIncome', operator: '<=', value: 450000 }
        ]
      }),
      ruleDescription: 'Must be a student and annual family income must be ₹4.5 Lakhs or less.'
    },
    {
      name: 'Pradhan Mantri Vishwakarma Scheme',
      nameHi: 'पीएम विश्वकर्मा योजना',
      nameMr: 'पीएम विश्वकर्मा योजना',
      description: 'A central scheme to support traditional artisans and craftspeople of 18 trades, providing skill upgradation, toolkit incentive, and collateral-free credit.',
      descriptionHi: '18 व्यवसायों के पारंपरिक कारीगरों और शिल्पकारों को समर्थन देने, कौशल उन्नयन, टूलकिट प्रोत्साहन और बिना गारंटी ऋण प्रदान करने की एक केंद्रीय योजना।',
      descriptionMr: '१८ व्यवसायातील पारंपारिक कारागीर आणि शिल्पकारांना मदत करणे, कौशल्य वाढवणे, टूलकिट प्रोत्साहन आणि तारणमुक्त कर्ज देणारी केंद्रीय योजना.',
      benefits: 'Skill training with ₹500/day stipend, ₹15,000 toolkit incentive, and collateral-free enterprise loans up to ₹3 Lakhs at concessionary 5% interest rate.',
      benefitsHi: 'प्रति दिन ₹500 वजीफे के साथ कौशल प्रशिक्षण, ₹15,000 टूलकिट प्रोत्साहन, और 5% रियायती ब्याज दर पर ₹3 लाख तक का उद्यम ऋण।',
      benefitsMr: 'दररोज ₹५०० मानधनासह कौशल्य प्रशिक्षण, ₹१५,००० टूलकिट प्रोत्साहन आणि ५% सवलतीच्या दरात ₹३ लाखांपर्यंतचे तारणमुक्त कर्ज.',
      category: 'Employment',
      ministry: 'Ministry of Micro, Small and Medium Enterprises',
      ministryHi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      ministryMr: 'सूक्ष्म, लघु आणि मध्यम उद्योग मंत्रालय',
      department: 'Development Commissioner MSME',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Mobile Number linked with Aadhaar', 'Bank Account details', 'Ration Card']),
      applicationProcess: 'Apply at nearest CSC center, undergo three-tier verification (Gram Panchayat, District, and State level) to get Vishwakarma Certificate.',
      applicationProcessHi: 'निकटतम सीएससी केंद्र पर आवेदन करें, विश्वकर्मा प्रमाणपत्र प्राप्त करने के लिए त्रि-स्तरीय सत्यापन से गुजरें।',
      applicationProcessMr: 'जवळच्या CSC केंद्रावर अर्ज करा, विश्वकर्मा प्रमाणपत्र मिळवण्यासाठी त्रि-स्तरीय पडताळणी प्रक्रियेतून जा.',
      officialUrl: 'https://pmvishwakarma.gov.in/',
      infoUrl: 'https://pmvishwakarma.gov.in/FAQ',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'PM Vishwakarma Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 18 },
          { field: 'annualIncome', operator: '<=', value: 300000 },
          { field: 'employmentStatus', operator: '==', value: 'Self-Employed' }
        ]
      }),
      ruleDescription: 'Must be at least 18 years old, self-employed, and annual income under ₹3 Lakhs.'
    },
    {
      name: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
      nameHi: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना',
      nameMr: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना',
      description: 'A flagship health insurance scheme of Government of Maharashtra, providing cashless hospitalization for identified major illnesses to beneficiary families.',
      descriptionHi: 'महाराष्ट्र सरकार की एक प्रमुख स्वास्थ्य बीमा योजना, जो लाभार्थी परिवारों को पहचान की गई प्रमुख बीमारियों के लिए कैशलेस अस्पताल में भर्ती की सुविधा प्रदान करती है।',
      descriptionMr: 'महाराष्ट्र सरकारची एक प्रमुख आरोग्य विमा योजना, जी लाभार्थी कुटुंबांना प्रमुख आजारांसाठी कॅशलेस उपचारांची सुविधा प्रदान करते.',
      benefits: 'Cashless medical treatment cover up to ₹5,00,000 per family per year in empaneled hospitals.',
      benefitsHi: 'सूचीबद्ध अस्पतालों में प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस चिकित्सा उपचार कवर।',
      benefitsMr: 'सूचीबद्ध रुग्णालयांमध्ये प्रति कुटुंब प्रति वर्ष ₹५,००,००० पर्यंतचे कॅशलेस वैद्यकीय उपचार संरक्षण.',
      category: 'Healthcare',
      ministry: 'Public Health Department, Maharashtra',
      ministryHi: 'सार्वजनिक स्वास्थ्य विभाग, महाराष्ट्र',
      ministryMr: 'सार्वजनिक आरोग्य विभाग, महाराष्ट्र',
      department: 'State Health Assurance Society',
      isCentral: false,
      state: 'Maharashtra',
      documents: JSON.stringify(['Yellow/Orange/Antyodaya Ration Card', 'Aadhaar Card / Driving License / Voter ID', 'Medical Report']),
      applicationProcess: 'Visit empaneled hospital, contact Arogyamitra at MJPJAY desk, get diagnosis, hospital submits pre-authorization request online.',
      applicationProcessHi: 'सूचीबद्ध अस्पताल जाएं, आरोग्यमित्र से संपर्क करें, निदान प्राप्त करें, अस्पताल ऑनलाइन पूर्व-प्राधिकरण अनुरोध भेजता है।',
      applicationProcessMr: 'सूचीबद्ध रुग्णालयाला भेट द्या, आरोग्यमित्राशी संपर्क साधा, रुग्णालय ऑनलाइन पूर्व-अधिकृतता विनंती सादर करते.',
      officialUrl: 'https://www.myscheme.gov.in/schemes/mjpjay',
      infoUrl: 'https://www.myscheme.gov.in/schemes/mjpjayMJPJAY/MJPJAYSchemeInfo.jsp',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'MJPJAY Trust Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'state', operator: '==', value: 'Maharashtra' },
          { field: 'annualIncome', operator: '<=', value: 300000 }
        ]
      }),
      ruleDescription: 'Must reside in Maharashtra and annual family income must be under ₹3 Lakhs.'
    },
    {
      name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY) 4.0',
      nameHi: 'प्रधानमंत्री कौशल विकास योजना ४.०',
      nameMr: 'प्रधानमंत्री कौशल विकास योजना ४.०',
      description: 'A skill certification scheme aiming to enable large numbers of Indian youth to take up industry-relevant skill training that will help them secure a better livelihood.',
      descriptionHi: 'एक कौशल प्रमाणन योजना जिसका उद्देश्य बड़ी संख्या में भारतीय युवाओं को उद्योग-प्रासंगिक कौशल प्रशिक्षण प्राप्त करने में सक्षम बनाना है।',
      descriptionMr: 'एक कौशल्य प्रमाणपत्र योजना ज्याचा उद्देश मोठ्या संख्येने भारतीय तरुणांना उद्योग-संबंधित कौशल्य प्रशिक्षण घेण्यास सक्षम करणे आहे.',
      benefits: 'Free industry-relevant skill training, assessment, and certification with placement assistance and a reward of ₹8,000 for successfully certified candidates.',
      benefitsHi: 'प्लेसमेंट सहायता के साथ मुफ्त कौशल प्रशिक्षण, मूल्यांकन और प्रमाणन, और प्रमाण पत्र प्राप्त करने वाले उम्मीदवारों के लिए ₹8,000 का पुरस्कार।',
      benefitsMr: 'प्लेसमेंट सहाय्यतेसह विनामूल्य कौशल्य प्रशिक्षण, मूल्यांकन आणि प्रमाणपत्र, आणि प्रमाणित उमेदवारांसाठी ₹८,००० चे बक्षीस.',
      category: 'Skill Development',
      ministry: 'Ministry of Skill Development and Entrepreneurship',
      ministryHi: 'कौशल विकास और उद्यमिता मंत्रालय',
      ministryMr: 'कौशल्य विकास आणि उद्योजकता मंत्रालय',
      department: 'National Skill Development Corporation (NSDC)',
      isCentral: true,
      state: null,
      documents: JSON.stringify(['Aadhaar Card', 'Educational Certificate', 'Bank Account details', 'Passport size photographs']),
      applicationProcess: 'Register on Skill India Digital portal, find a training center near you, enroll in a course, clear assessment exams to get certificate.',
      applicationProcessHi: 'स्किल इंडिया डिजिटल पोर्टल पर पंजीकरण करें, अपने पास एक प्रशिक्षण केंद्र खोजें, कोर्स में दाखिला लें और परीक्षा पास करें।',
      applicationProcessMr: 'कौशल्य भारत डिजिटल पोर्टलवर नोंदणी करा, तुमच्या जवळचे प्रशिक्षण केंद्र शोधा, अभ्यासक्रमात प्रवेश घ्या आणि परीक्षा उत्तीर्ण व्हा.',
      officialUrl: 'https://www.myscheme.gov.in/schemes/pmkvy',
      infoUrl: 'https://www.skillindiadigital.gov.in/',
      deadline: '',
      status: 'Active',
      verificationStatus: 'Verified',
      source: 'Skill India Portal',
      conditions: JSON.stringify({
        logical: 'AND',
        conditions: [
          { field: 'age', operator: '>=', value: 15 },
          { field: 'age', operator: '<=', value: 45 },
          { field: 'employmentStatus', operator: '==', value: 'Unemployed' }
        ]
      }),
      ruleDescription: 'Must be between 15 and 45 years of age and currently unemployed.'
    }
  ];

  for (const s of schemesData) {
    const { ruleDescription, conditions, ...schemeProps } = s;

    // Create the Scheme
    const createdScheme = await prisma.scheme.create({
      data: {
        ...schemeProps,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Create the associated eligibility rules
    await prisma.schemeRule.create({
      data: {
        schemeId: createdScheme.id,
        conditions: conditions,
        description: ruleDescription,
      }
    });
  }

  console.log(`Seeded ${schemesData.length} schemes successfully.`);

  // 5. Seed some initial bookmarks for Rahul Sharma to match mockups ("Saved Schemes: 8")
  // Let's retrieve Rahul Sharma and some schemes
  const rahul = await prisma.user.findFirst({ where: { email: 'rahul@gmail.com' } });
  const allSchemes = await prisma.scheme.findMany();

  // Let's bookmark the first 8 schemes for Rahul
  for (let i = 0; i < Math.min(8, allSchemes.length); i++) {
    await prisma.bookmark.create({
      data: {
        userId: rahul.id,
        schemeId: allSchemes[i].id
      }
    });
  }
  console.log('Bookmarked 8 schemes for demo user Rahul.');

  // 6. Seed some applications for tracking ("Application in Progress: 3")
  const statuses = ['Submitted', 'Under Review', 'Additional Documents Required'];
  for (let i = 0; i < 3; i++) {
    await prisma.application.create({
      data: {
        userId: rahul.id,
        schemeId: allSchemes[i].id,
        status: statuses[i],
        appliedDate: '2026-08-01',
        referenceNumber: `BHARAT100${i}294`,
        notes: `Demo application status tracking - step ${i + 1}`,
      }
    });
  }
  console.log('Seeded 3 application trackers for demo user Rahul.');

  // 7. Seed some demo notifications
  const notifications = [
    {
      userId: rahul.id,
      type: 'NEW_SCHEME',
      title: 'New Matching Scheme Found',
      message: 'Based on your profile, you may be eligible for the Namo Shetkari Mahasanman Nidhi Yojana. Check your eligibility now!'
    },
    {
      userId: rahul.id,
      type: 'DEADLINE_REMINDER',
      title: 'Application Deadline Approaching',
      message: 'The deadline for Post Matric Scholarship Scheme for SC Students is approaching on 2026-10-31. Apply soon!'
    },
    {
      userId: rahul.id,
      type: 'PROFILE_INCOMPLETE',
      title: 'Complete Your Profile',
      message: 'Your profile is 85% complete. Add your land holding size to get even better matching scheme recommendations.'
    }
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: n
    });
  }
  console.log('Seeded 3 notifications for demo user Rahul.');

  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
