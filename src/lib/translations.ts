import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/locales";

type TranslationValue = string | ((...args: Array<string | number>) => string);

const translations = {
  en: {
    "common.brand": "AMAN",
    "common.brandAccent": "MOBILE",
    "common.products": "products",
    "common.product": "product",
    "common.current": "Current",
    "common.switch": "Switch",
    "header.searchLabel": "Search products",
    "header.searchPlaceholder": "Search premium electronics...",
    "header.mobileSearchPlaceholder": "Search...",
    "header.languageSettings": "Language settings",
    "header.adminDashboard": "Admin Dashboard",
    "footer.description":
      "Quality phones and tech, checked and graded so you can shop with confidence.",
    "footer.collections": "Collections",
    "footer.phones": "Phones",
    "footer.audio": "Audio",
    "footer.computing": "Computing",
    "footer.wearables": "Wearables",
    "footer.accessories": "Accessories",
    "footer.skincare": "Skincare",
    "footer.shoes": "Shoes",
    "footer.support": "Support",
    "footer.shipping": "Shipping Info",
    "footer.returns": "Returns",
    "footer.contact": "Contact",
    "footer.company": "Company",
    "footer.about": "About Us",
    "footer.sustainability": "Sustainability",
    "footer.privacy": "Privacy Policy",
    "footer.copyright": (year) =>
      `(c) ${year} Aman Mobiles. All rights reserved.`,
    "home.eyebrow": "New and Certified Pre-Owned Phones",
    "home.description":
      "From phones to audio, computing to everyday accessories - every item is checked and graded, so you know exactly what you're getting.",
    "home.cta": "Explore Collection",
    "home.categoryHeading": "Shop by Category",
    "home.categoryDescription":
      "Phones, audio, computing, wearables, and more - all checked before they ship.",
    "home.featured": "Popular Right Now",
    "home.viewAll": "View All",
    "home.empty": "No products are in the catalog yet.",
    "products.title": "Our",
    "products.titleAccent": "Collection",
    "products.description":
      "Browse new and certified pre-owned phones, audio, computing, and more - every item graded and checked before it ships.",
    "products.count": (count) =>
      `${count} product${Number(count) === 1 ? "" : "s"}`,
    "products.empty": "No products are available yet.",
    "collections.eyebrow": "Collections",
    "collections.title": "Shop by",
    "collections.titleAccent": "Collection",
    "collections.description":
      "Browse the storefront by category so customers can start with the kind of devices they actually want, not just a flat catalog.",
    "collections.organizeLabel": "Organize collections",
    "collections.organizeCategory": "By category",
    "collections.organizeBrand": "By brand",
    "collections.categorySummary":
      "Curated category entry points for faster browsing.",
    "collections.brandSummary": "Browse the live catalog grouped by brand.",
    "collections.phonesTitle": "Phones",
    "collections.phonesDescription":
      "New and certified pre-owned phones organized for faster browsing.",
    "collections.phonesCta": "Explore phones",
    "collections.audioTitle": "Audio",
    "collections.audioDescription":
      "Headphones, earbuds, speakers, and listening gear for travel, work, and everyday setups.",
    "collections.audioCta": "Explore audio",
    "collections.computingTitle": "Computing",
    "collections.computingDescription":
      "Laptops, tablets, accessories, and productivity-focused devices for desk and mobile workflows.",
    "collections.computingCta": "Explore computing",
    "collections.wearablesTitle": "Wearables",
    "collections.wearablesDescription":
      "Smart watches, fitness-oriented devices, and accessories designed to stay with you all day.",
    "collections.wearablesCta": "Explore wearables",
    "collections.accessoriesTitle": "Accessories",
    "collections.accessoriesDescription":
      "Cases, chargers, cables, and useful add-ons for daily devices and setups.",
    "collections.accessoriesCta": "Explore accessories",
    "collections.skincareTitle": "Skincare",
    "collections.skincareDescription":
      "Routine essentials, beauty care, and skincare products for daily replenishment.",
    "collections.skincareCta": "Explore skincare",
    "collections.shoesTitle": "Shoes",
    "collections.shoesDescription":
      "Shoes, sneakers, and footwear listings organized for faster browsing.",
    "collections.shoesCta": "Explore shoes",
    "collections.brandCta": "Browse brand",
    "collections.brandCount": (count) =>
      `${count} product${Number(count) === 1 ? "" : "s"}`,
    "collections.otherBrand": "Other Brands",
    "search.eyebrow": "Search",
    "search.title": "Search the catalog",
    "search.resultsTitle": (query) => `Results for "${query}"`,
    "search.matchCount": (count) =>
      `${count} match${Number(count) === 1 ? "" : "es"} found`,
    "search.helper": "Use the search bar above to explore the storefront.",
    "search.empty": "No products matched your search.",
    "search.start": "Start typing a product name, subtitle, or handle.",
    "language.eyebrow": "Preferences",
    "language.title": "Language Settings",
    "language.description":
      "Choose the storefront locale you want to use across browsing and checkout pages.",
    "language.ko": "Korean",
    "language.en": "English",
    "product.back": "Back to Collection",
    "product.noImage": "No image available",
    "product.certified": "Certified Pre-Owned",
    "product.new": "New",
    "product.noDescription": "No description available yet.",
    "product.originalSpec": "View original spec sheet",
    "product.shippingNote": "Free express shipping & local taxes included.",
    "product.variantUnavailable": "Variant unavailable",
    "product.askAdmin": "Ask About This Product",
    "product.askWhatsapp": "Ask on WhatsApp",
    "product.askEmail": "Ask by Email",
    "product.listingDetails": "Listing Details",
    "product.batteryHealth": "Battery Health",
    "product.grading": "Grading",
    "product.verifyImei": (imei) => `Verify IMEI: ${imei}`,
    "product.express": "Express",
    "product.globalCare": "Global Care",
    "product.returns": "Returns",
    "product.specSheet": "Product",
    "product.specSheetAccent": "Spec Sheet",
    "product.specImported": "Spec sheet imported",
    "product.specLinked": "Spec sheet linked",
    "product.specLinkedBody":
      "We have the original product spec page linked for this listing, but the structured specs have not been imported yet. Re-save the product in admin to cache the latest specs from the source page.",
    "product.similar": "Similar",
    "product.similarAccent": "Innovation",
    "cart.aria": (count) =>
      `Shopping cart${Number(count) ? ` with ${count} items` : ""}`,
    "cart.checkout": "Checkout",
    "cart.description":
      "No account required. Share your delivery details and we will process your order directly.",
    "cart.orderSummary": "Order Summary",
    "cart.remove": "Remove",
    "cart.subtotal": "Subtotal",
    "cart.empty": "Your shopping bag is empty.",
    "cart.deliveryDetails": "Delivery Details",
    "cart.deliveryDescription":
      "These details create a real order for admin and provide the address needed for delivery.",
    "cart.fullName": "Full Name",
    "cart.email": "Email Address",
    "cart.phone": "Phone Number",
    "cart.address1": "Address Line 1",
    "cart.address2": "Address Line 2",
    "cart.city": "City",
    "cart.province": "Province / State",
    "cart.postalCode": "Postal Code",
    "cart.submitting": "Submitting...",
    "cart.submit": "Submit Order",
    "cart.backHome": "Back to Home",
    "addToCart.decrease": "Decrease quantity",
    "addToCart.increase": "Increase quantity",
    "addToCart.inBag": "In shopping bag",
    "addToCart.addMore": "Add One More",
    "addToCart.checkout": "Proceed to Checkout",
    "addToCart.adding": "Adding...",
    "addToCart.added": "Added to Shopping Bag",
    "addToCart.add": "Add to Shopping Bag",
  },
  ko: {
    "common.brand": "아만",
    "common.brandAccent": "모바일",
    "common.products": "개 상품",
    "common.product": "개 상품",
    "common.current": "현재",
    "common.switch": "변경",
    "header.searchLabel": "상품 검색",
    "header.searchPlaceholder": "프리미엄 전자제품 검색...",
    "header.mobileSearchPlaceholder": "검색...",
    "header.languageSettings": "언어 설정",
    "header.adminDashboard": "관리자 대시보드",
    "footer.description":
      "엄선된 프리미엄 전자제품과 모바일 기기를 더 편하게 만날 수 있는 스토어입니다.",
    "footer.collections": "컬렉션",
    "footer.phones": "Phones",
    "footer.audio": "오디오",
    "footer.computing": "컴퓨팅",
    "footer.wearables": "웨어러블",
    "footer.accessories": "Accessories",
    "footer.skincare": "Skincare",
    "footer.shoes": "Shoes",
    "footer.support": "고객지원",
    "footer.shipping": "배송 안내",
    "footer.returns": "반품",
    "footer.contact": "문의",
    "footer.company": "회사",
    "footer.about": "소개",
    "footer.sustainability": "지속 가능성",
    "footer.privacy": "개인정보 처리방침",
    "footer.copyright": (year) =>
      `© ${year} 아만 모바일. 미래를 위해 설계되었습니다.`,
    "home.eyebrow": "차세대 전자제품",
    "home.description": "실시간 카탈로그에 등록된 최신 상품을 둘러보세요.",
    "home.cta": "컬렉션 보기",
    "home.categoryHeading": "카테고리별 쇼핑",
    "home.categoryDescription":
      "Phones, audio, computing, wearables, and more - all checked before they ship.",
    "home.featured": "추천 상품",
    "home.viewAll": "전체 보기",
    "home.empty": "아직 카탈로그에 등록된 상품이 없습니다.",
    "products.title": "아만 모바일",
    "products.titleAccent": "컬렉션",
    "products.description": "혁신적인 기술 제품 라인업을 확인해 보세요.",
    "products.count": (count) => `${count}개 상품`,
    "products.empty": "현재 이용 가능한 상품이 없습니다.",
    "collections.eyebrow": "컬렉션",
    "collections.title": "카테고리별",
    "collections.titleAccent": "쇼핑",
    "collections.description":
      "전체 상품 목록만 보는 대신, 원하는 기기 유형부터 빠르게 둘러볼 수 있도록 컬렉션별로 탐색해 보세요.",
    "collections.organizeLabel": "정렬 방식",
    "collections.organizeCategory": "카테고리별",
    "collections.organizeBrand": "브랜드별",
    "collections.categorySummary":
      "카테고리 중심으로 빠르게 둘러볼 수 있는 진입점입니다.",
    "collections.brandSummary": "실시간 카탈로그를 브랜드별로 묶어 탐색합니다.",
    "collections.phonesTitle": "Phones",
    "collections.phonesDescription":
      "New and certified pre-owned phones organized for faster browsing.",
    "collections.phonesCta": "Explore phones",
    "collections.audioTitle": "오디오",
    "collections.audioDescription":
      "헤드폰, 이어버드, 스피커 등 이동 중이든 책상 앞이든 잘 어울리는 청취 기기를 모았습니다.",
    "collections.audioCta": "오디오 보기",
    "collections.computingTitle": "컴퓨팅",
    "collections.computingDescription":
      "노트북, 태블릿, 액세서리 등 업무와 생산성 중심의 기기를 살펴보세요.",
    "collections.computingCta": "컴퓨팅 보기",
    "collections.wearablesTitle": "웨어러블",
    "collections.wearablesDescription":
      "스마트워치, 피트니스 기기, 그리고 하루 종일 함께하는 액세서리를 확인해 보세요.",
    "collections.wearablesCta": "웨어러블 보기",
    "collections.accessoriesTitle": "Accessories",
    "collections.accessoriesDescription":
      "Cases, chargers, cables, and useful add-ons for daily devices and setups.",
    "collections.accessoriesCta": "Explore accessories",
    "collections.skincareTitle": "Skincare",
    "collections.skincareDescription":
      "Routine essentials, beauty care, and skincare products for daily replenishment.",
    "collections.skincareCta": "Explore skincare",
    "collections.shoesTitle": "Shoes",
    "collections.shoesDescription":
      "Shoes, sneakers, and footwear listings organized for faster browsing.",
    "collections.shoesCta": "Explore shoes",
    "collections.brandCta": "브랜드 보기",
    "collections.brandCount": (count) => `${count}개 상품`,
    "collections.otherBrand": "기타 브랜드",
    "search.eyebrow": "검색",
    "search.title": "카탈로그 검색",
    "search.resultsTitle": (query) => `"${query}" 검색 결과`,
    "search.matchCount": (count) => `${count}개 결과`,
    "search.helper": "상단 검색창에서 스토어 상품을 찾아보세요.",
    "search.empty": "검색어와 일치하는 상품이 없습니다.",
    "search.start": "상품명, 부제목 또는 핸들을 입력해 보세요.",
    "language.eyebrow": "환경 설정",
    "language.title": "언어 설정",
    "language.description":
      "탐색과 결제 페이지에서 사용할 스토어 언어를 선택하세요.",
    "language.ko": "한국어",
    "language.en": "영어",
    "product.back": "컬렉션으로 돌아가기",
    "product.noImage": "이미지가 없습니다",
    "product.certified": "인증 중고 상품",
    "product.new": "새 상품",
    "product.noDescription": "아직 상품 설명이 없습니다.",
    "product.originalSpec": "원본 사양서 보기",
    "product.shippingNote": "빠른 배송과 현지 세금이 포함되어 있습니다.",
    "product.variantUnavailable": "옵션을 사용할 수 없습니다",
    "product.askAdmin": "이 상품 문의하기",
    "product.askWhatsapp": "WhatsApp으로 문의하기",
    "product.askEmail": "이메일로 문의하기",
    "product.listingDetails": "상품 상세 정보",
    "product.batteryHealth": "배터리 성능",
    "product.grading": "등급",
    "product.verifyImei": (imei) => `IMEI 확인: ${imei}`,
    "product.express": "빠른 배송",
    "product.globalCare": "글로벌 케어",
    "product.returns": "반품",
    "product.specSheet": "상품",
    "product.specSheetAccent": "사양서",
    "product.specImported": "사양서 가져옴",
    "product.specLinked": "사양서 링크됨",
    "product.specLinkedBody":
      "이 상품에는 원본 사양 페이지가 연결되어 있지만 구조화된 사양은 아직 가져오지 않았습니다. 관리자에서 상품을 다시 저장하면 출처 페이지의 최신 사양을 캐시합니다.",
    "product.similar": "비슷한",
    "product.similarAccent": "상품",
    "cart.aria": (count) =>
      `장바구니${Number(count) ? `, ${count}개 상품` : ""}`,
    "cart.checkout": "결제",
    "cart.description":
      "계정 없이 주문할 수 있습니다. 배송 정보를 입력하면 주문을 바로 처리합니다.",
    "cart.orderSummary": "주문 요약",
    "cart.remove": "삭제",
    "cart.subtotal": "소계",
    "cart.empty": "장바구니가 비어 있습니다.",
    "cart.deliveryDetails": "배송 정보",
    "cart.deliveryDescription":
      "이 정보로 실제 주문이 생성되며 배송 주소로 사용됩니다.",
    "cart.fullName": "이름",
    "cart.email": "이메일 주소",
    "cart.phone": "전화번호",
    "cart.address1": "주소 1",
    "cart.address2": "주소 2",
    "cart.city": "도시",
    "cart.province": "시/도",
    "cart.postalCode": "우편번호",
    "cart.submitting": "제출 중...",
    "cart.submit": "주문 제출",
    "cart.backHome": "홈으로 돌아가기",
    "addToCart.decrease": "수량 줄이기",
    "addToCart.increase": "수량 늘리기",
    "addToCart.inBag": "장바구니에 담김",
    "addToCart.addMore": "하나 더 담기",
    "addToCart.checkout": "결제로 이동",
    "addToCart.adding": "담는 중...",
    "addToCart.added": "장바구니에 담겼습니다",
    "addToCart.add": "장바구니에 담기",
  },
} as const satisfies Record<SupportedLocale, Record<string, TranslationValue>>;

export type TranslationKey = keyof typeof translations.en;

export function getSupportedLocale(locale: string): SupportedLocale {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function getTranslator(locale: string) {
  const supportedLocale = getSupportedLocale(locale);
  const dictionary = translations[supportedLocale];
  const fallback = translations[DEFAULT_LOCALE];

  return (key: TranslationKey, ...args: Array<string | number>) => {
    const value = dictionary[key] ?? fallback[key] ?? key;

    if (typeof value === "function") {
      const formatter = value as (
        ...formatterArgs: Array<string | number>
      ) => string;
      return formatter(...args);
    }

    return value;
  };
}
