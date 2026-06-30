import { useState, useEffect, useRef } from "react";

var S = {
  bg: "#f8f9fc",
  card: "#ffffff",
  card2: "#f2f4f8",
  border: "#d0d7e8",
  text: "#0d1117",
  muted: "#1e2a42",
  dim: "#4a5568",
  accent: "#1a1d2e",
  gold: "#d97706",
  purple: "#7c3aed",
  green: "#059669",
  blue: "#2563eb",
  orange: "#ea580c",
  red: "#dc2626",
  font: "system-ui,-apple-system,sans-serif",
  mono: "'Courier New',monospace",
  serif: "'Playfair Display',Georgia,serif",
};

var SB_INDUSTRIES = [
  { id: "prof_services",   label: "Professional Services",          sub: "consulting, accounting, law, design, marketing, IT services", pct: "~14%" },
  { id: "retail",          label: "Retail & E-commerce",            sub: "",                                                            pct: "~11%" },
  { id: "trades",          label: "Skilled Trades & Construction",  sub: "HVAC, electrical, plumbing, contracting, specialty",          pct: "~10%" },
  { id: "health_personal", label: "Health Care & Personal Services",sub: "independent practices, dental, PT, salons, wellness",         pct: "~10%" },
  { id: "food_hosp",       label: "Food Service & Hospitality",     sub: "restaurants, cafes, catering, lodging",                       pct: "~9%"  },
  { id: "auto_repair",     label: "Auto, Repair & Equipment",       sub: "auto repair, cleaning, rental, maintenance",                  pct: "~9%"  },
  { id: "realestate",      label: "Real Estate & Property",         sub: "agencies, property management, brokers",                      pct: "~7%"  },
  { id: "transport",       label: "Transportation & Logistics",     sub: "small trucking, delivery, fleet",                             pct: "~6%"  },
  { id: "admin_staffing",  label: "Administrative & Staffing",      sub: "cleaning, security, recruiting",                              pct: "~6%"  },
  { id: "manuf_wholesale", label: "Manufacturing & Wholesale",      sub: "",                                                            pct: "~9%"  },
  { id: "finance_advisory",label: "Finance, Insurance & Advisory",  sub: "independent advisors, brokers, agents",                      pct: "~3%"  },
  { id: "other",           label: "Other",                          sub: "describe your business below",                               pct: "~6%"  },
];

var SB_STAGES = [
  { id: "solo_pre",     label: "Solo / Pre-revenue or just hitting profitability",          sub: "No employees yet, early days" },
  { id: "solo_profit",  label: "Solo & profitable",                                         sub: "No employees, running lean and making money" },
  { id: "early_team",   label: "Early team — 1 to 9 employees",                             sub: "Owner still does delivery, knows every customer" },
  { id: "growing",      label: "Growing & owner-dependent — 10 to 25 employees",            sub: "Owner is still the rainmaker" },
  { id: "scaled",       label: "Scaled but owner-dependent — 26 to 100 employees",          sub: "Business doesn't run without you" },
  { id: "systematized", label: "Systematized",                                              sub: "Business runs with or without you day-to-day" },
  { id: "exiting",      label: "Exit-ready / in transition",                                sub: "Selling, handing off, or winding down in 24 months" },
  { id: "over100",      label: "More than 100 employees",                                   sub: "" },
];

var SB_ARCHETYPES = {
  prof_services: [
    { id: "solo_consultant", label: "Independent Consultant", desc: "Sells expertise and advice directly to clients on a project or retainer basis. Threatened by AI tools that automate research, analysis, and report generation." },
    { id: "boutique_agency", label: "Boutique Agency", desc: "Small team delivering creative, marketing, or strategic services to business clients. Threatened by AI content generation and automated campaign tools." },
    { id: "accounting_tax", label: "Accounting & Tax Practice", desc: "Prepares taxes, manages books, and advises on financial compliance for individuals or small businesses. Threatened by AI-powered accounting software and automated tax filing." },
    { id: "law_practice", label: "Small Law Practice", desc: "Provides legal services in one or more practice areas to individuals or businesses. Threatened by AI contract review, document automation, and online legal platforms." },
    { id: "it_services", label: "IT Services & Managed Services Provider", desc: "Provides technology support, maintenance, and consulting to small businesses. Threatened by AI-assisted diagnostics and offshore managed service competitors." },
    { id: "recruiting", label: "Independent Recruiter / Staffing Firm", desc: "Matches candidates to employer roles, earning fees on placements. Threatened by AI resume screening, LinkedIn automation, and direct-hire platforms." },
    { id: "training", label: "Training & Coaching Practice", desc: "Delivers professional development, coaching, or skills training to individuals or organizations. Threatened by AI tutors, on-demand learning platforms, and automated coaching tools." },
    { id: "other_prof", label: "None of these — describe your business", desc: "" },
  ],
  retail: [
    { id: "brick_mortar", label: "Brick-and-Mortar Retail Store", desc: "Sells physical products from a storefront to walk-in customers. Threatened by e-commerce giants, AI-personalized online shopping, and same-day delivery." },
    { id: "ecommerce_only", label: "E-commerce Only Retailer", desc: "Sells products exclusively online via own site or marketplaces like Amazon and Etsy. Threatened by AI-optimized competitors and rising ad costs." },
    { id: "hybrid_retail", label: "Hybrid Retail (Store + Online)", desc: "Operates both a physical location and an online store. Faces pressure from pure-play online retailers with lower overhead." },
    { id: "specialty_retail", label: "Specialty / Niche Retailer", desc: "Sells a focused category of products to a specific customer segment. Defensibility comes from curation and expertise but threatened by AI-powered niche discovery." },
    { id: "consignment", label: "Consignment or Resale Shop", desc: "Sells second-hand or consigned goods, earning a cut of each sale. Threatened by AI-driven resale platforms like ThredUp and Poshmark." },
    { id: "wholesale_dist", label: "Wholesale Distributor to Retailers", desc: "Buys in bulk and resells to retail businesses. Threatened by direct-to-retailer manufacturer relationships and AI-optimized supply chains." },
    { id: "other_retail", label: "None of these — describe your business", desc: "" },
  ],
  trades: [
    { id: "hvac", label: "HVAC Contractor", desc: "Installs, maintains, and repairs heating and cooling systems for residential and commercial clients. Threatened by AI diagnostic tools and national service aggregators." },
    { id: "electrical", label: "Electrical Contractor", desc: "Performs electrical installation and repair work for residential and commercial clients. Defensible through licensing but threatened by aggregator platforms commoditizing job bidding." },
    { id: "plumbing", label: "Plumbing Contractor", desc: "Provides plumbing installation, repair, and emergency services. Similar aggregator and commoditization pressure as electrical." },
    { id: "general_contractor", label: "General Contractor / Remodeler", desc: "Manages construction and renovation projects, coordinating subcontractors and materials. Threatened by AI project estimation tools and platform-based contractor matching." },
    { id: "specialty_trade", label: "Specialty Trade Contractor", desc: "Provides a focused trade service such as roofing, flooring, painting, or landscaping. Threatened by national franchise competitors and online bidding platforms." },
    { id: "home_services", label: "Home Services Operator", desc: "Delivers recurring residential services such as cleaning, lawn care, or pest control. Threatened by app-based service platforms and AI-optimized scheduling competitors." },
    { id: "other_trades", label: "None of these — describe your business", desc: "" },
  ],
  health_personal: [
    { id: "independent_practice", label: "Independent Medical or Dental Practice", desc: "Provides clinical care directly to patients outside a hospital system. Threatened by AI diagnostics, telehealth platforms, and private equity consolidation." },
    { id: "pt_chiro", label: "Physical Therapy or Chiropractic Practice", desc: "Delivers hands-on rehabilitative or musculoskeletal care. Threatened by AI exercise prescription tools and telehealth PT platforms." },
    { id: "mental_health", label: "Mental Health Practice", desc: "Provides therapy, counseling, or psychiatric services to individuals or groups. Threatened by AI therapy apps and teletherapy platforms at lower price points." },
    { id: "salon_spa", label: "Salon, Spa, or Personal Care Studio", desc: "Delivers beauty, grooming, or wellness services to individual clients. Relatively low AI threat on delivery but threatened by booking aggregators and chain competition." },
    { id: "fitness", label: "Fitness Studio or Personal Training", desc: "Provides group fitness classes or one-on-one training. Threatened by AI fitness apps, on-demand platforms, and large gym chains." },
    { id: "wellness_alt", label: "Wellness or Alternative Health Practice", desc: "Delivers services such as acupuncture, nutrition coaching, or holistic health. Threatened by AI health coaches and wellness apps." },
    { id: "childcare", label: "Childcare or Early Education Provider", desc: "Operates a daycare, preschool, or after-school program. Regulatory barriers provide some protection but faces staffing and margin pressure." },
    { id: "other_health", label: "None of these — describe your business", desc: "" },
  ],
  food_hosp: [
    { id: "independent_restaurant", label: "Independent Restaurant", desc: "Operates a full-service or fast-casual dining establishment. Threatened by AI-optimized delivery platforms, ghost kitchens, and rising labor costs." },
    { id: "cafe_coffee", label: "Cafe or Coffee Shop", desc: "Serves coffee, light food, and beverages in a community-oriented setting. Threatened by chain competitors and AI-personalized loyalty programs." },
    { id: "catering", label: "Catering Company", desc: "Prepares and delivers food for events, corporate clients, or institutions. Threatened by AI-powered event planning platforms and meal delivery aggregators." },
    { id: "food_truck", label: "Food Truck or Pop-Up Operator", desc: "Sells food from a mobile unit or temporary location. Lower overhead but dependent on foot traffic and social media visibility." },
    { id: "bakery_specialty", label: "Bakery or Specialty Food Producer", desc: "Produces and sells baked goods or specialty food products direct to consumers or wholesale. Threatened by AI-optimized food manufacturing and direct-to-consumer brands." },
    { id: "lodging", label: "Small Lodging Operator", desc: "Runs a bed and breakfast, boutique hotel, or short-term rental portfolio. Threatened by AI-optimized pricing on Airbnb and OTA platforms." },
    { id: "other_food", label: "None of these — describe your business", desc: "" },
  ],
  auto_repair: [
    { id: "auto_repair_shop", label: "Independent Auto Repair Shop", desc: "Services and repairs personal vehicles for local customers. Threatened by AI diagnostic tools and national chain competitors like Jiffy Lube and Firestone." },
    { id: "auto_body", label: "Auto Body & Collision Shop", desc: "Repairs vehicle bodies and paint after accidents. Insurance relationships are a moat but threatened by consolidation and AI damage estimation tools." },
    { id: "auto_dealer", label: "Independent Used Car Dealer", desc: "Buys and resells used vehicles to individual buyers. Threatened by AI-powered pricing platforms and online dealers like Carvana." },
    { id: "equipment_rental", label: "Equipment Rental Company", desc: "Rents tools, machinery, or vehicles to contractors and consumers. Threatened by peer-to-peer rental platforms and AI inventory optimization." },
    { id: "cleaning_service", label: "Commercial or Residential Cleaning Service", desc: "Provides recurring cleaning to homes or businesses. Low AI threat on delivery but highly price-competitive and threatened by app-based platforms." },
    { id: "mobile_service", label: "Mobile Service Operator", desc: "Delivers repair or maintenance services on-site at the customer's location. Convenience is the moat but threatened by aggregator platforms commoditizing booking." },
    { id: "other_auto", label: "None of these — describe your business", desc: "" },
  ],
  realestate: [
    { id: "buyers_agent", label: "Independent Residential Buyer's Agent", desc: "Represents buyers in home purchases, earning commission on closed transactions. Threatened by AI-powered search platforms and flat-fee buyer representation services." },
    { id: "listing_specialist", label: "Residential Listing Specialist", desc: "Lists and markets homes for sellers, managing pricing, staging, and negotiation. Threatened by AI valuation tools and discount brokerages." },
    { id: "dual_agent", label: "Dual-Agent Generalist", desc: "Represents both buyers and sellers across residential transactions. Broad exposure to AI automation on both sides of the transaction." },
    { id: "property_manager", label: "Property Manager", desc: "Manages day-to-day operations of rental properties on behalf of owners. Threatened by AI-driven tenant screening and rent collection platforms." },
    { id: "flipper", label: "Residential Developer / Flipper", desc: "Buys, renovates, and resells residential properties for profit. Threatened by AI deal-finding tools and automated renovation cost estimators." },
    { id: "commercial_broker", label: "Commercial Real Estate Broker", desc: "Leases or sells commercial properties including office, retail, and industrial. Slower AI disruption but threatened by data platforms commoditizing market intelligence." },
    { id: "auctioneer", label: "Real Estate Auctioneer", desc: "Sells properties via competitive auction format, often distressed or estate sales. Threatened by online auction platforms." },
    { id: "other_realestate", label: "None of these — describe your business", desc: "" },
  ],
  transport: [
    { id: "trucking", label: "Small Trucking Operator", desc: "Hauls freight for businesses using one or more trucks. Threatened by AI load-matching platforms and autonomous vehicle development." },
    { id: "delivery", label: "Local Delivery Service", desc: "Provides last-mile delivery for businesses or consumers in a defined geography. Threatened by Amazon Logistics, DoorDash, and AI-optimized routing." },
    { id: "moving", label: "Moving Company", desc: "Provides residential or commercial moving services. Threatened by app-based moving platforms and AI-powered booking and pricing tools." },
    { id: "limo_charter", label: "Limousine or Charter Service", desc: "Provides scheduled or on-demand transportation for individuals or groups. Threatened by Uber Black and AI-optimized ride dispatch." },
    { id: "courier", label: "Courier or Messenger Service", desc: "Provides time-sensitive document or package delivery for businesses. Threatened by same-day delivery expansion from major carriers." },
    { id: "logistics_broker", label: "Freight Broker", desc: "Connects shippers with carriers, earning a margin on each load. Highly threatened by AI-powered freight matching platforms." },
    { id: "other_transport", label: "None of these — describe your business", desc: "" },
  ],
  admin_staffing: [
    { id: "janitorial", label: "Janitorial or Facility Maintenance Company", desc: "Provides recurring cleaning and maintenance to commercial clients. Price-competitive market threatened by app-based platforms and large national contractors." },
    { id: "security", label: "Private Security Company", desc: "Provides security personnel and monitoring services to businesses and events. Threatened by AI surveillance systems and remote monitoring technology." },
    { id: "staffing_agency", label: "Staffing or Temp Agency", desc: "Connects businesses with temporary or permanent workers across industries. Threatened by AI recruiting platforms and direct-hire tools." },
    { id: "landscaping", label: "Landscaping or Groundskeeping Company", desc: "Provides outdoor maintenance and landscaping services to residential or commercial clients. Threatened by app-based platforms and robotic mowing technology." },
    { id: "waste_mgmt", label: "Waste Management or Recycling Service", desc: "Collects and disposes of waste for commercial or residential clients. Relatively defensible through contracts but threatened by municipal consolidation." },
    { id: "other_admin", label: "None of these — describe your business", desc: "" },
  ],
  manuf_wholesale: [
    { id: "custom_manufacturer", label: "Custom Manufacturer", desc: "Produces goods to customer specifications in small or medium runs. Threatened by AI-assisted design tools and overseas low-cost manufacturing." },
    { id: "contract_manufacturer", label: "Contract Manufacturer", desc: "Produces goods for other brands on a white-label or contract basis. Threatened by AI-optimized supply chains and direct overseas sourcing." },
    { id: "wholesale_distributor", label: "Wholesale Distributor", desc: "Buys products in bulk from manufacturers and resells to retailers or businesses. Threatened by direct-to-retailer manufacturer relationships and AI inventory tools." },
    { id: "specialty_producer", label: "Specialty Food or Beverage Producer", desc: "Produces and sells a branded food or beverage product to retailers or direct to consumers. Threatened by AI-optimized large-scale producers and private label competition." },
    { id: "fabricator", label: "Metal, Wood, or Materials Fabricator", desc: "Cuts, shapes, and assembles materials for construction or industrial clients. Threatened by AI-driven CNC automation and offshore fabrication." },
    { id: "import_export", label: "Import / Export Business", desc: "Sources goods internationally and sells domestically, or vice versa. Threatened by AI tariff optimization tools and direct sourcing platforms." },
    { id: "other_manuf", label: "None of these — describe your business", desc: "" },
  ],
  finance_advisory: [
    { id: "financial_advisor", label: "Independent Financial Advisor", desc: "Provides investment advice and financial planning to individual clients. Threatened by AI robo-advisors and low-cost index fund platforms." },
    { id: "insurance_agent", label: "Independent Insurance Agent or Broker", desc: "Sells and services insurance policies across carriers. Threatened by AI-powered comparison platforms and direct-to-consumer insurance products." },
    { id: "mortgage_broker", label: "Mortgage Broker", desc: "Matches borrowers with lenders and manages the loan origination process. Threatened by AI underwriting tools and digital mortgage platforms like Better.com." },
    { id: "bookkeeping", label: "Bookkeeping or Payroll Service", desc: "Manages financial records and payroll processing for small business clients. Highly threatened by AI-powered accounting software like QuickBooks AI and Pilot." },
    { id: "tax_preparer", label: "Independent Tax Preparer", desc: "Prepares individual or business tax returns. Threatened by AI tax filing tools and expanding capabilities of TurboTax and similar platforms." },
    { id: "business_broker", label: "Business Broker", desc: "Facilitates the buying and selling of small businesses. Defensible through relationships but threatened by online business marketplace platforms." },
    { id: "other_finance", label: "None of these — describe your business", desc: "" },
  ],
  other: [
    { id: "other_free", label: "Describe your business model", desc: "" },
  ],
};

var SB_PROMO_CODES = ["DZFRIEND", "DZPREVIEW", "DZTEST"];

var BIZ_GOALS = [
  { id: "stable", label: "Keep it stable and profitable", sub: "I'm not looking to grow — just run a good business" },
  { id: "grow_steady", label: "Grow steadily", sub: "Expand over the next few years at a manageable pace" },
  { id: "scale", label: "Scale aggressively", sub: "I want this to be significantly bigger" },
  { id: "exit", label: "Prepare for exit or succession", sub: "Planning to sell, hand off, or wind down in 1–5 years" },
  { id: "unsure", label: "Not sure yet", sub: "Still figuring out the direction" },
];

var BIZ_AGES = [
  { id: "under35", label: "Under 35" },
  { id: "35_44", label: "35–44" },
  { id: "45_54", label: "45–54" },
  { id: "55_64", label: "55–64" },
  { id: "65plus", label: "65 or older" },
];

var BIZ_LOCATIONS = [
  { id: "metro", label: "Major city or metro area" },
  { id: "suburban", label: "Suburban area" },
  { id: "rural", label: "Small town or rural area" },
  { id: "online", label: "Primarily online — location doesn't matter" },
];

var BIZ_CHANNELS = [
  { id: "referrals", label: "Word of mouth and referrals" },
  { id: "social", label: "Social media" },
  { id: "paid_ads", label: "Paid advertising" },
  { id: "search", label: "Search / Google / online directories" },
  { id: "foot_traffic", label: "Walk-in / foot traffic / location" },
  { id: "repeat", label: "Repeat and returning customers" },
  { id: "influencers", label: "Online influencers or content" },
  { id: "other_channel", label: "Other — describe below" },
];

var BIZ_TECH = [
  { id: "avoid", label: "I avoid new tools unless I have to", sub: "If it isn't broken, I don't fix it" },
  { id: "trust", label: "I'll try something if someone I trust recommends it", sub: "Word of mouth drives my tech decisions" },
  { id: "proven", label: "I adopt tools when they're proven and practical", sub: "I wait until something is reliable and worth it" },
  { id: "early", label: "I actively look for new tools to stay competitive", sub: "I'm usually an early adopter" },
];

var BIZ_CUSTOMER_SPREAD = [
  { id: "handful", label: "A handful of clients make up most of my income", sub: "Losing one would hurt significantly" },
  { id: "mixed", label: "A mix — some regulars but no single one dominates", sub: "Balanced but not fully diversified" },
  { id: "broad", label: "Broad customer base", sub: "Many customers — no single one matters too much" },
  { id: "variable", label: "Highly variable — project by project or seasonal", sub: "Income concentration shifts constantly" },
];

var BIZ_DIFF = [
  { id: "price", label: "Mostly price", sub: "I compete on cost — I'm usually the affordable option" },
  { id: "convenience", label: "Convenience or location", sub: "I'm the easiest or most accessible option" },
  { id: "relationships", label: "Personal relationships and trust", sub: "Customers stay because they know and trust me personally" },
  { id: "expertise", label: "Specialized expertise or quality", sub: "Hard-to-find skills or quality that commands a premium" },
  { id: "unique", label: "Something genuinely unique", sub: "Competitors can't easily replicate what I offer" },
];

var SB_SESSION_PROMO = "30FREE";

function SBNavbar() {
  return (
    <div style={{
      width: "100%",
      borderBottom: "1px solid " + S.border,
      background: S.card,
      padding: "0 24px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
    }}>
      <a
        href="https://defensiblezone.ai"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: S.mono,
          fontSize: 13,
          fontWeight: 700,
          color: S.accent,
          textDecoration: "none",
          letterSpacing: "0.06em",
        }}
      >
        DEFENSIBLE ZONE™
      </a>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <a
          href="https://defensiblezone.ai/businesses"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.muted,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          For Businesses
        </a>
        <a
          href="mailto:support@recursiolab.com"
          style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.muted,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          Support
        </a>
      </div>
    </div>
  );
}

function SBFooter() {
  return (
    <div style={{ marginTop: 48, borderTop: "1px solid " + S.border, padding: "24px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
        <a href="https://defensiblezone.ai" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, textDecoration: "none" }}>
          defensiblezone.ai
        </a>
        <a href="https://defensiblezone.ai/businesses" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, textDecoration: "none" }}>
          For Businesses
        </a>
        <a href="mailto:support@recursiolab.com"
          style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, textDecoration: "none" }}>
          Support
        </a>
      </div>
    </div>
  );
}

export default function SmallBusiness(props) {
  var [step, setStep] = useState(0);
  var [industry, setIndustry] = useState("");
  var [otherText, setOtherText] = useState("");
  var [stage, setStage] = useState("");
  var [archetype, setArchetype] = useState("");
  var [archetypes, setArchetypes] = useState([]);
  var [archetypeOther, setArchetypeOther] = useState("");
  var [sliderVP, setSliderVP] = useState(5);
  var [sliderCS, setSliderCS] = useState(5);
  var [sliderKM, setSliderKM] = useState(5);
  var [sliderTH, setSliderTH] = useState(5);
  var [snapshot, setSnapshot] = useState([]);
  var [snapshotLoading, setSnapshotLoading] = useState(false);
  var [snapshotError, setSnapshotError] = useState("");
  var [newSentence, setNewSentence] = useState("");
  var [editDraft, setEditDraft] = useState("");
  var [gateEmail, setGateEmail] = useState("");
  var [gateSent, setGateSent] = useState(false);
  var [gateVerified, setGateVerified] = useState(false);
  var [gateLoading, setGateLoading] = useState(false);
  var [gateError, setGateError] = useState("");
  var [showResend, setShowResend] = useState(false);
  var [report, setReport] = useState(null);
  var [reportLoading, setReportLoading] = useState(false);
  var [reportError, setReportError] = useState("");
  var [tier, setTier] = useState(0);
  var [checkoutLoading, setCheckoutLoading] = useState(false);
  var [checkoutError, setCheckoutError] = useState(null);
  var [promoCode, setPromoCode] = useState("");
  var [promoError, setPromoError] = useState("");
  var [testMode, setTestMode] = useState(false);
  var [promoUsed, setPromoUsed] = useState(false);
  var [sessionPromo, setSessionPromo] = useState(false);
  var [showPromo, setShowPromo] = useState(false);
  var [bizGoal, setBizGoal] = useState("");
  var [bizAge, setBizAge] = useState("");
  var [bizLocation, setBizLocation] = useState("");
  var [bizChannels, setBizChannels] = useState([]);
  var [bizChannelOther, setBizChannelOther] = useState("");
  var [bizTech, setBizTech] = useState("");
  var [bizCustomerSpread, setBizCustomerSpread] = useState("");
  var [bizDiff, setBizDiff] = useState("");

  var sessionBriefSentRef = useRef(false);
  var sendPaidOnNextReport = useRef(false);

  var _industry = industry;
  var _stage = stage;
  var _archetype = archetype;
  var _archetypeOther = archetypeOther;
  var _sliderVP = sliderVP;
  var _sliderCS = sliderCS;
  var _sliderKM = sliderKM;
  var _sliderTH = sliderTH;
  var _snapshot = snapshot;
  var _bizGoal = bizGoal;
  var _bizAge = bizAge;
  var _bizLocation = bizLocation;
  var _bizChannels = bizChannels;
  var _bizChannelOther = bizChannelOther;
  var _bizTech = bizTech;
  var _bizCustomerSpread = bizCustomerSpread;
  var _bizDiff = bizDiff;

  try {
    var sbSaved = localStorage.getItem("dz_sb_state");
    if (sbSaved) {
      var sbParsed = JSON.parse(sbSaved);
      if (sbParsed.industry) _industry = sbParsed.industry;
      if (sbParsed.stage) _stage = sbParsed.stage;
      if (sbParsed.archetype) _archetype = sbParsed.archetype;
      if (sbParsed.archetypeOther) _archetypeOther = sbParsed.archetypeOther;
      if (typeof sbParsed.sliderVP === "number") _sliderVP = sbParsed.sliderVP;
      if (typeof sbParsed.sliderCS === "number") _sliderCS = sbParsed.sliderCS;
      if (typeof sbParsed.sliderKM === "number") _sliderKM = sbParsed.sliderKM;
      if (typeof sbParsed.sliderTH === "number") _sliderTH = sbParsed.sliderTH;
      if (Array.isArray(sbParsed.snapshot)) _snapshot = sbParsed.snapshot;
      if (sbParsed.bizGoal) _bizGoal = sbParsed.bizGoal;
      if (sbParsed.bizAge) _bizAge = sbParsed.bizAge;
      if (sbParsed.bizLocation) _bizLocation = sbParsed.bizLocation;
      if (Array.isArray(sbParsed.bizChannels)) _bizChannels = sbParsed.bizChannels;
      if (sbParsed.bizChannelOther) _bizChannelOther = sbParsed.bizChannelOther;
      if (sbParsed.bizTech) _bizTech = sbParsed.bizTech;
      if (sbParsed.bizCustomerSpread) _bizCustomerSpread = sbParsed.bizCustomerSpread;
      if (sbParsed.bizDiff) _bizDiff = sbParsed.bizDiff;
    }
  } catch(e) {}

  var sliderCSS = "input[type=range].sb-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;border:none;background:#d0d7e8} input[type=range].sb-slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)} input[type=range].sb-slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;cursor:pointer;}";

  async function fetchSnapshot() {
    setSnapshotLoading(true);
    setSnapshotError("");
    setSnapshot([]);
    var industryLabel = (SB_INDUSTRIES.find(function(i) { return i.id === industry; }) || {}).label || industry;
    var stageLabel = (SB_STAGES.find(function(s) { return s.id === stage; }) || {}).label || stage;
    var currentArchetypes = SB_ARCHETYPES[industry] || [];
    var archetypeLabel = archetypeOther.trim() || (currentArchetypes.find(function(a) { return a.id === archetype; }) || {}).label || archetype;
    var prompt = "You are an expert in small business strategy and AI disruption.\n\nA US small business owner has provided this profile:\n- Industry: " + industryLabel + "\n- Stage: " + stageLabel + "\n- Business model: " + archetypeLabel + "\n- Value proposition clarity (0-10): " + sliderVP + "\n- Customer switching cost (0-10): " + sliderCS + "\n- Knowledge moat (0-10): " + sliderKM + "\n- Time horizon (0-10): " + sliderTH +
      "\n- Business goal: " + _bizGoal +
      "\n- Owner age bracket: " + _bizAge +
      "\n- Location type: " + _bizLocation +
      "\n- Customer acquisition channels: " +
        (_bizChannels.join(", ") || "not provided") +
        (_bizChannelOther ? " (" + _bizChannelOther + ")" : "") +
      "\n- Tech adoption style: " + _bizTech +
      "\n- Customer base spread: " + _bizCustomerSpread +
      "\n- Primary differentiator: " + _bizDiff + "\n\nWrite a 3-4 sentence competitive landscape snapshot for this business. Be specific to their industry and model. Describe the AI threat they face right now, what is still defensible, and what is most at risk. Do not be generic.\n\nReturn ONLY valid JSON:\n{\"sentences\":[\"Sentence one.\",\"Sentence two.\",\"Sentence three.\",\"Sentence four.\"]}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error("API error");
      var raw = data.content.map(function(b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response");
      var parsed = JSON.parse(m[0]);
      setSnapshot((parsed.sentences || []).map(function(text, i) {
        return { id: "s" + i, text: text, wrong: false, editing: false };
      }));
      setSnapshotLoading(false);
    } catch(e) {
      setSnapshotError("Something went wrong. Please try again.");
      setSnapshotLoading(false);
    }
  }

  function calcSubScores(vp, cs, km) {
    var valueD = Math.round(vp * 10);
    var customerD = Math.round(cs * 10);
    var operationalD = Math.round(km * 10);
    return { valueD: valueD, customerD: customerD, operationalD: operationalD };
  }

  function calcOverallScore(vp, cs, km) {
    var v = 100 * Math.pow(vp / 10, 0.40) * Math.pow(cs / 10, 0.35) * Math.pow(km / 10, 0.25);
    return Math.min(100, Math.round(v));
  }

  function getScoreLabel(score) {
    if (score < 30) return "High Risk — significant repositioning needed.";
    if (score < 50) return "Vulnerable — real gaps to address before AI accelerates.";
    if (score < 70) return "Moderate — some strong anchors, targeted moves needed.";
    if (score < 85) return "Solid — well-positioned with room to extend your lead.";
    return "Exceptional — you are operating in rare territory.";
  }

  function getScoreColor(score) {
    if (score < 40) return S.red;
    if (score < 65) return S.gold;
    return S.green;
  }

  function getDiagnosticFlags(vp, cs, km, th, snapshotData) {
    var flags = [];
    if (vp >= 7) flags.push({ type: "positive", label: "Strong value proposition" });
    if (cs >= 7) flags.push({ type: "positive", label: "Strong customer moat" });
    if (km >= 7) flags.push({ type: "positive", label: "Deep knowledge moat" });
    if (vp < 4) flags.push({ type: "warning", label: "Commoditization exposure — value proposition needs sharpening" });
    if (cs < 4) flags.push({ type: "warning", label: "Customer fragility — low switching costs" });
    if (km >= 7 && th <= 3) flags.push({ type: "warning", label: "Exit Risk — concentrated value, short time horizon" });
    var wrongCount = snapshotData.filter(function(s) { return s.wrong; }).length;
    if (wrongCount > 0) flags.push({ type: "warning", label: "AI substitution active — you flagged threats in your landscape" });
    return flags;
  }

  function isValidEmail(email) {
    var at = email.indexOf("@");
    if (at === -1) return false;
    return email.indexOf(".", at + 1) !== -1;
  }

  async function handleGateSubmit() {
    var trimmed = gateEmail.trim();
    if (!isValidEmail(trimmed)) {
      setGateError("Please enter a valid email address.");
      return;
    }
    setGateError("");
    try {
      localStorage.setItem("dz_sb_state", JSON.stringify({
        industry: industry,
        otherText: otherText,
        stage: stage,
        archetype: archetype,
        archetypeOther: archetypeOther,
        sliderVP: sliderVP,
        sliderCS: sliderCS,
        sliderKM: sliderKM,
        sliderTH: sliderTH,
        snapshot: snapshot,
        bizGoal: bizGoal,
        bizAge: bizAge,
        bizLocation: bizLocation,
        bizChannels: bizChannels,
        bizChannelOther: bizChannelOther,
        bizTech: bizTech,
        bizCustomerSpread: bizCustomerSpread,
        bizDiff: bizDiff,
      }));
    } catch(e) {}
    setGateLoading(true);
    try {
      var res = await fetch("/api/send-gate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, product: "smallbusiness" }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setGateEmail(trimmed);
      setGateSent(true);
    } catch(e) {
      setGateError("Something went wrong. Please try again.");
    } finally {
      setGateLoading(false);
    }
  }

  async function handleUnlockCheckout(tier) {
    if (!gateEmail || !gateEmail.trim()) {
      setCheckoutError("Please verify your email before checkout.");
      return;
    }
    setCheckoutLoading(tier);
    setCheckoutError(null);
    try {
      var res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "smallbusiness",
          email: gateEmail.trim(),
          tier: tier,
          testMode: testMode,
        }),
      });
      var data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout");
      try {
        localStorage.setItem("dz_saved_report_sb", JSON.stringify({
          tier: tier,
          gateEmail: gateEmail,
        }));
      } catch(_e) {}
      window.location.href = data.url;
    } catch(e) {
      setCheckoutError(e.message || "Could not start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  }

  async function sendSessionBrief(reportData) {
    if (sessionBriefSentRef.current) return;
    sessionBriefSentRef.current = true;
    var emailType = sendPaidOnNextReport.current ? "paid" : "session_brief";
    var industryLabel = (SB_INDUSTRIES.find(function(i) { return i.id === _industry; }) || {}).label || _industry;
    try {
      await fetch("/api/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          product: "smallbusiness",
          ownerEmail: gateEmail,
          adminEmail: "dilip@recursiolab.com",
          profile: {
            industry: industryLabel,
            stage: _stage,
            archetype: _archetype,
            archetypeOther: _archetypeOther,
            sliderVP: _sliderVP,
            sliderCS: _sliderCS,
            sliderKM: _sliderKM,
            sliderTH: _sliderTH,
            snapshot: _snapshot,
            bizGoal: _bizGoal,
            bizAge: _bizAge,
            bizLocation: _bizLocation,
            bizChannels: _bizChannels,
            bizTech: _bizTech,
            bizCustomerSpread: _bizCustomerSpread,
            bizDiff: _bizDiff,
          },
          report: reportData,
        }),
      });
    } catch(e) {
      console.error("Session brief email failed:", e);
    }
  }

  async function fetchReport() {
    setReportLoading(true);
    setReportError("");
    var _stageLabel = (SB_STAGES.find(function(s) { return s.id === _stage; }) || {}).label || _stage;
    var currentArchetypes = SB_ARCHETYPES[_industry] || [];
    var _archetypeLabel = _archetypeOther.trim() || (currentArchetypes.find(function(a) { return a.id === _archetype; }) || {}).label || _archetype;
    var overallScore = calcOverallScore(_sliderVP, _sliderCS, _sliderKM);
    var subScores = calcSubScores(_sliderVP, _sliderCS, _sliderKM);
    var flags = getDiagnosticFlags(_sliderVP, _sliderCS, _sliderKM, _sliderTH, _snapshot);
    var flagLabels = flags.map(function(f) { return f.label; }).join(", ");
    var snapshotText = _snapshot.filter(function(s) { return !s.wrong; }).map(function(s) { return s.text; }).join(" ");
    var prompt = "You are a senior business strategist and AI disruption expert writing a premium paid diagnostic report for a US small business owner. This must read like advice from a trusted advisor who has deep knowledge of their specific industry. Every section must be specific to their exact business type, stage, and inputs. No generic advice. No filler. No platitudes.\n\nBUSINESS PROFILE:\n- Industry: " + _industry + "\n- Stage: " + _stageLabel + "\n- Business model: " + _archetypeLabel + "\n- Overall Defensibility Score: " + overallScore + "/100\n- Value Defensibility: " + subScores.valueD + "/100\n- Customer Defensibility: " + subScores.customerD + "/100\n- Operational Defensibility: " + subScores.operationalD + "/100\n- Diagnostic flags: " + (flagLabels || "none") + "\n- Owner time horizon (0=exiting soon, 10=10+ years): " + _sliderTH + "\n- Value proposition clarity (0-10): " + _sliderVP + "\n- Customer switching cost (0-10): " + _sliderCS + "\n- Knowledge moat (0-10): " + _sliderKM +
      "\n- Business goal: " + _bizGoal +
      "\n- Owner age bracket: " + _bizAge +
      "\n- Location type: " + _bizLocation +
      "\n- Customer acquisition channels: " +
        (_bizChannels.join(", ") || "not provided") +
        (_bizChannelOther ? " (" + _bizChannelOther + ")" : "") +
      "\n- Tech adoption style: " + _bizTech +
      "\n- Customer base spread: " + _bizCustomerSpread +
      "\n- Primary differentiator: " + _bizDiff +
      "\n- Competitive landscape notes: " + (snapshotText || "not provided") + "\n\nGenerate a comprehensive 10-section Defensibility Report. Be brutally specific.\n\nSection 1 — Score in Context (2-3 sentences): What does this score mean for THIS specific business right now? What is the AI exposure and owner-dependence risk? Be direct and honest.\n\nSection 2 — Top 5 Risks (prioritized): Exactly 5 risks ranked most to least urgent. Each risk: title (5 words max), priority_rationale (one sentence on WHY this rank), action (2-3 sentences of specific actionable steps for this exact business model).\n\nSection 3 — Strongest Anchors (2-4 items): What is genuinely defensible right now. Each anchor: title and one honest sentence. If nothing is strongly defensible, say so.\n\nSection 4 — One Strategic Question: A single reframing question a great consultant would leave them with. Plus 2 sentence context explaining why this question matters for their specific situation.\n\nSection 5 — What to Do First (3 sentences): The single most important move given their score, flags, and time horizon. Make it land.\n\nSection 6 — AI Threat Timeline: What AI will be able to do to this specific business model in the next 12 months, 24 months, and 36 months that it cannot do today. Be specific to their industry and archetype. Not generic AI trends — specific threats to THIS business. Each period: 2-3 sentences.\n\nSection 7 — Competitive Analysis: A rigorous analysis of the competitive landscape for this specific business type. Cover: (a) who the main competitors are today — both traditional and AI-powered, (b) what competitive advantages are being eroded by AI right now, (c) what the 2-3 most defensible competitive positions look like in this industry. Use your knowledge of current market conditions. Be specific — name actual platforms, tools, and competitors where relevant.\n\nSection 8 — What a Buyer Would Say: If someone tried to acquire or succeed this business today, what would they pay a premium for and what would cause them to heavily discount the price. Two lists: premium_factors (2-3 items) and discount_factors (2-3 items). Each item is a title and one sentence.\n\nSection 9 — Owner Dependence Analysis: List exactly 3-4 specific ways this business currently depends on the owner personally. Be specific to their business model and inputs — not generic. Each dependency: a short name and one sentence describing the risk if the owner steps back or exits.\n\nSection 10 — Competitive Benchmark: How does a business like this typically score on defensibility, and what do the higher-scoring ones do differently. Give a typical score range for this industry and archetype, and list 2-3 specific things that separate high-scoring from low-scoring businesses in this category.\n\nReturn ONLY valid JSON — no markdown, no backticks, no preamble:\n{\"section1\":\"...\",\"section2\":[{\"title\":\"...\",\"priority_rationale\":\"...\",\"action\":\"...\"}],\"section3\":[{\"title\":\"...\",\"desc\":\"...\"}],\"section4\":{\"question\":\"...\",\"context\":\"...\"},\"section5\":\"...\",\"section6\":{\"months12\":\"...\",\"months24\":\"...\",\"months36\":\"...\"},\"section7\":{\"competitors\":\"...\",\"eroding\":\"...\",\"defensible\":\"...\"},\"section8\":{\"premium_factors\":[{\"title\":\"...\",\"desc\":\"...\"}],\"discount_factors\":[{\"title\":\"...\",\"desc\":\"...\"}]},\"section9\":[{\"name\":\"...\",\"risk\":\"...\"}],\"section10\":{\"typical_range\":\"...\",\"differentiators\":\"...\"}}";
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      var data = await res.json();
      if (!data.content) throw new Error("No content in API response: " + JSON.stringify(data).slice(0, 200));
      var raw = data.content.map(function(b) { return b.text || ""; }).join("");
      var m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON found in: " + raw.slice(0, 300));
      var cleaned = m[0].replace(/<cite[^>]*>([\s\S]*?)<\/cite>/g, "$1");
      var parsed = JSON.parse(cleaned);
      setReport(parsed);
      sendSessionBrief(parsed);
      setReportLoading(false);
    } catch(e) {
      setReportError("Error: " + (e && e.message ? e.message : String(e)));
      setReportLoading(false);
    }
  }

  function applyPromoCode() {
    var v = (promoCode || "").trim().toUpperCase();
    if (SB_PROMO_CODES.includes(v)) {
      setTier(2);
      setPromoUsed(true);
      setPromoError("");
    } else if (v === SB_SESSION_PROMO) {
      setTier(1);
      setPromoUsed(true);
      setSessionPromo(true);
      setPromoError("");
    } else if (v === "DZONE") {
      setTestMode(true);
      setPromoError("");
    } else {
      setPromoError("That code isn't valid.");
    }
  }

  function resetAll() {
    try { localStorage.removeItem("dz_sb_state"); } catch(e) {}
    setStep(0);
    setIndustry(""); setOtherText("");
    setStage("");
    setArchetype(""); setArchetypes([]); setArchetypeOther("");
    setSliderVP(5); setSliderCS(5); setSliderKM(5); setSliderTH(5);
    setSnapshot([]); setSnapshotLoading(false); setSnapshotError(""); setNewSentence("");
    setGateEmail(""); setGateSent(false); setGateVerified(false);
    setGateLoading(false); setGateError(""); setShowResend(false);
    setReport(null); setReportLoading(false); setReportError("");
    setTier(0); setPromoCode(""); setPromoError(""); setPromoUsed(false); setSessionPromo(false); setShowPromo(false);
    setBizGoal(""); setBizAge(""); setBizLocation("");
    setBizChannels([]); setBizChannelOther("");
    setBizTech(""); setBizCustomerSpread(""); setBizDiff("");
  }

  useEffect(function() {
    if (step === 5) fetchSnapshot();
  }, [step]);

  useEffect(function() {
    if (step === 8 && gateVerified && !report && !reportLoading) {
      fetchReport();
    }
  }, [step, gateVerified]);

  useEffect(function() {
    var params = new URLSearchParams(window.location.search);
    var gateToken = params.get("gate_token");
    if (!gateToken) return;
    window.history.replaceState({}, "", window.location.pathname);
    setGateLoading(true);
    (async function() {
      try {
        var res = await fetch("/api/verify-gate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: gateToken }),
        });
        var data = await res.json();
        if (data && data.valid === true) {
          if (data.email) setGateEmail(data.email);
          setGateVerified(true);
          try {
            var savedStr = localStorage.getItem("dz_sb_state");
            if (savedStr) {
              var savedData = JSON.parse(savedStr);
              if (savedData.industry) setIndustry(savedData.industry);
              if (savedData.otherText) setOtherText(savedData.otherText);
              if (savedData.stage) setStage(savedData.stage);
              if (savedData.archetype) setArchetype(savedData.archetype);
              if (savedData.archetypeOther) setArchetypeOther(savedData.archetypeOther);
              if (typeof savedData.sliderVP === "number") setSliderVP(savedData.sliderVP);
              if (typeof savedData.sliderCS === "number") setSliderCS(savedData.sliderCS);
              if (typeof savedData.sliderKM === "number") setSliderKM(savedData.sliderKM);
              if (typeof savedData.sliderTH === "number") setSliderTH(savedData.sliderTH);
              if (Array.isArray(savedData.snapshot)) setSnapshot(savedData.snapshot);
              if (savedData.bizGoal) setBizGoal(savedData.bizGoal);
              if (savedData.bizAge) setBizAge(savedData.bizAge);
              if (savedData.bizLocation) setBizLocation(savedData.bizLocation);
              if (Array.isArray(savedData.bizChannels)) setBizChannels(savedData.bizChannels);
              if (savedData.bizChannelOther) setBizChannelOther(savedData.bizChannelOther);
              if (savedData.bizTech) setBizTech(savedData.bizTech);
              if (savedData.bizCustomerSpread) setBizCustomerSpread(savedData.bizCustomerSpread);
              if (savedData.bizDiff) setBizDiff(savedData.bizDiff);
            }
          } catch(e) {}
          setStep(8);
        } else if (data && data.reason === "expired") {
          setGateError("expired");
          setStep(7);
        } else {
          setGateError("invalid");
          setStep(7);
        }
      } catch(e) {
        setGateError("invalid");
        setStep(7);
      } finally {
        setGateLoading(false);
      }
    })();
  }, []);

  useEffect(function() {
    var params = new URLSearchParams(window.location.search);

    if (params.get("success") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      try {
        var saved = localStorage.getItem("dz_saved_report_sb");
        if (saved) {
          var parsed = JSON.parse(saved);
          if (parsed && parsed.gateEmail) setGateEmail(parsed.gateEmail);
        }
      } catch(e) {}

      (async function() {
        try {
          var res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: params.get("session_id"),
              product: "smallbusiness",
            }),
          });
          var data = await res.json();
          if (!res.ok) throw new Error((data && data.error) || "verify-payment failed");
          if (data.tier >= 2) { sendPaidOnNextReport.current = true; }
          if (data.token) {
            try { localStorage.setItem("dz_token_smallbusiness", data.token); } catch(_e) {}
          }
          setTier(data.tier);
          setGateVerified(true);
          setStep(8);
          setCheckoutError(null);
        } catch(e) {
          setCheckoutError("Payment verification failed. Please contact support@recursiolab.com");
        } finally {
          window.scrollTo(0, 0);
        }
      })();
      return;
    }

    if (params.get("canceled") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      try {
        var saved2 = localStorage.getItem("dz_saved_report_sb");
        if (saved2) {
          var parsed2 = JSON.parse(saved2);
          if (parsed2 && parsed2.gateEmail) setGateEmail(parsed2.gateEmail);
        }
      } catch(e) {}
      setCheckoutError("Payment was cancelled — try again when you're ready.");
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(function() {
    if (!gateSent) { setShowResend(false); return; }
    setShowResend(false);
    var t = setTimeout(function() { setShowResend(true); }, 30000);
    return function() { clearTimeout(t); };
  }, [gateSent]);

  useEffect(function() {
    try {
      var stored = localStorage.getItem("dz_token_smallbusiness");
      if (!stored) return;
      var payload = stored.split(".")[1];
      var base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      var decoded = JSON.parse(atob(base64));
      if (!decoded) return;
      if (decoded.exp && Date.now() / 1000 > decoded.exp) return;
      if (decoded.product && decoded.product !== "smallbusiness") return;
      if (decoded.tier >= 1) setTier(decoded.tier);
    } catch(e) {}
  }, []);

  if (step === 0) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px", boxSizing: "border-box" }}>
          <div style={{
            fontFamily: S.mono,
            fontSize: 11,
            color: S.gold,
            letterSpacing: "0.14em",
            marginBottom: 20,
            fontWeight: 600,
          }}>
            DEFENSIBLE ZONE™ · SMALL BUSINESS OWNER EDITION
          </div>
          <h1 style={{
            fontFamily: S.serif,
            fontSize: 40,
            color: S.text,
            margin: "0 0 20px",
            lineHeight: 1.2,
            fontWeight: 600,
          }}>
            Is your business still defensible?
          </h1>
          <p style={{
            fontSize: 18,
            color: S.dim,
            lineHeight: 1.75,
            margin: "0 0 40px",
            maxWidth: 560,
          }}>
            AI is changing what businesses are worth. In 15 minutes, find out where yours stands — and what to do about it.
          </p>
          <button
            onClick={function() { setStep(1); }}
            style={{
              background: S.accent,
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              padding: "18px 36px",
              fontSize: 16,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            BEGIN ASSESSMENT →
          </button>
          <p style={{
            fontFamily: S.mono,
            fontSize: 12,
            color: S.dim,
            marginTop: 20,
            letterSpacing: "0.04em",
          }}>
            Designed for US small business owners with 1–100 employees.
          </p>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 1 OF 8 — YOUR INDUSTRY
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "12.5%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            What kind of business do you run?
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Pick the category that fits best. This shapes everything that follows.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 24 }}>
            {SB_INDUSTRIES.map(function(ind) {
              var isSelected = industry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={function() { setIndustry(ind.id); }}
                  style={{
                    background: isSelected ? S.accent : S.card,
                    border: "1px solid " + (isSelected ? S.accent : S.border),
                    borderRadius: 12,
                    padding: "16px 18px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ind.sub ? 4 : 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? "#ffffff" : S.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
                      {ind.label}
                    </span>
                    <span style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: isSelected ? "rgba(255,255,255,0.7)" : S.gold, flexShrink: 0 }}>
                      {ind.pct}
                    </span>
                  </div>
                  {ind.sub ? (
                    <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.65)" : S.dim, lineHeight: 1.4 }}>
                      {ind.sub}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {industry === "other" ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
                DESCRIBE YOUR BUSINESS
              </div>
              <textarea
                value={otherText}
                onChange={function(e) { setOtherText(e.target.value); }}
                placeholder="e.g. We make custom furniture for commercial clients..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: S.font,
                  border: "1px solid " + S.border,
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  color: S.text,
                  background: S.card,
                }}
              />
            </div>
          ) : null}

          <button
            onClick={function() { setStep(2); }}
            disabled={!industry || (industry === "other" && !otherText.trim())}
            style={{
              background: (!industry || (industry === "other" && !otherText.trim())) ? S.card2 : S.accent,
              color: (!industry || (industry === "other" && !otherText.trim())) ? S.dim : "#ffffff",
              border: "1px solid " + ((!industry || (industry === "other" && !otherText.trim())) ? S.border : S.accent),
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: (!industry || (industry === "other" && !otherText.trim())) ? "not-allowed" : "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(0); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 2) {
    if (stage === "over100") {
      return (
        <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
          <SBNavbar />
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              STEP 2 OF 8 — BUSINESS STAGE
            </div>
            <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
              <div style={{ height: "100%", width: "25%", background: S.accent, borderRadius: 2 }} />
            </div>
            <div style={{ background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: "36px 32px", textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: S.mono, fontSize: 13, color: S.gold, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 16 }}>
                DEFENSIBLE ZONE™ · SMALL BUSINESS EDITION
              </div>
              <h2 style={{ fontFamily: S.serif, fontSize: 26, color: S.text, margin: "0 0 16px", lineHeight: 1.3, fontWeight: 600 }}>
                This assessment is designed for businesses with up to 100 employees.
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.7, margin: "0 0 24px" }}>
                For larger organizations, our team engagement product is a better fit. Reach out and we'll point you in the right direction.
              </p>
              <a
                href="mailto:support@recursiolab.com"
                style={{
                  display: "inline-block",
                  background: S.accent,
                  color: "#ffffff",
                  borderRadius: 10,
                  padding: "14px 28px",
                  fontFamily: S.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                }}
              >
                CONTACT US →
              </a>
            </div>
            <button
              onClick={function() { setStage(""); }}
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
            >
              ← BACK
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 2 OF 8 — BUSINESS STAGE
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "25%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Where is your business right now?
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Pick the stage that best describes how your business operates today.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {SB_STAGES.map(function(s) {
              var isSelected = stage === s.id;
              var isRedirect = s.id === "over100";
              return (
                <button
                  key={s.id}
                  onClick={function() { setStage(s.id); }}
                  style={{
                    background: isSelected ? S.accent : S.card,
                    border: "1px solid " + (isSelected ? S.accent : S.border),
                    borderRadius: 12,
                    padding: "16px 20px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: isSelected ? "#ffffff" : (isRedirect ? S.dim : S.text), lineHeight: 1.3 }}>
                    {s.label}
                  </div>
                  {s.sub ? (
                    <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 4, lineHeight: 1.4 }}>
                      {s.sub}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            onClick={function() { setStep(3); }}
            disabled={!stage}
            style={{
              background: !stage ? S.card2 : S.accent,
              color: !stage ? S.dim : "#ffffff",
              border: "1px solid " + (!stage ? S.border : S.accent),
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: !stage ? "not-allowed" : "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(1); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 3) {
    var currentArchetypes = SB_ARCHETYPES[industry] || SB_ARCHETYPES["other"];
    var isOtherSelected = archetype === "other_free" ||
      (archetype && archetype.startsWith("other_"));

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 3 OF 8 — YOUR BUSINESS MODEL
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "37.5%", background: S.accent, borderRadius: 2 }} />
          </div>

              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
                How does your business create value?
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
                Pick the model that fits best. This shapes how we score your defensibility.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {currentArchetypes.map(function(a) {
                  var isSelected = archetype === a.id;
                  var isFreeform = a.id.startsWith("other_");
                  return (
                    <button
                      key={a.id}
                      onClick={function() { setArchetype(a.id); if (!isFreeform) setArchetypeOther(""); }}
                      style={{
                        background: isSelected ? S.accent : S.card,
                        border: "1px solid " + (isSelected ? S.accent : S.border),
                        borderRadius: 12,
                        padding: "16px 20px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? "#ffffff" : S.text, marginBottom: a.desc ? 4 : 0 }}>
                        {a.label}
                      </div>
                      {a.desc ? (
                        <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.7)" : S.dim, lineHeight: 1.45 }}>
                          {a.desc}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {isOtherSelected ? (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
                    DESCRIBE YOUR BUSINESS MODEL
                  </div>
                  <p style={{
                    fontSize: 14,
                    color: S.dim,
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                    fontStyle: "italic",
                  }}>
                    Even a few sentences helps. You don't need to write
                    an essay — just describe what you do and who you
                    serve in your own words.
                  </p>
                  <div style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 12,
                  }}>
                    <div style={{
                      fontFamily: S.mono,
                      fontSize: 11,
                      color: "#1e40af",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}>
                      THE MORE CONTEXT YOU PROVIDE, THE BETTER YOUR ANALYSIS.
                    </div>
                    <div style={{ fontSize: 13, color: "#1e3a5f", lineHeight: 1.7 }}>
                      <div>• <strong>What you do and who you serve</strong> — your core service and customer type</div>
                      <div>• <strong>How you make money</strong> — pricing model, how often customers pay</div>
                      <div>• <strong>How customers find you</strong> — referrals, online, foot traffic, etc.</div>
                      <div>• <strong>What makes you different</strong> — why customers choose you over alternatives</div>
                      <div>• <strong>Your biggest challenge right now</strong> — what keeps you up at night</div>
                    </div>
                  </div>
                  <textarea
                    value={archetypeOther}
                    onChange={function(e) { setArchetypeOther(e.target.value); }}
                    placeholder="e.g. I run a preschool with 10 enrolled students. I charge $1,800/month per full-time student. Most families find us through word of mouth in the neighborhood. My biggest challenge is filling enrollment back to capacity after losing students during COVID..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      fontSize: 15,
                      fontFamily: S.font,
                      border: "1px solid " + S.border,
                      borderRadius: 10,
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                      color: S.text,
                      background: S.card,
                    }}
                  />
                  <div style={{
                    fontFamily: S.mono,
                    fontSize: 11,
                    color: archetypeOther.length < 100 ? S.orange : S.green,
                    marginTop: 6,
                    letterSpacing: "0.04em",
                  }}>
                    {archetypeOther.length === 0 ?
                      "Start typing — any context helps." :
                      archetypeOther.length < 100 ?
                      "Good start — a bit more detail will sharpen your results." :
                      archetypeOther.length < 200 ?
                      "Good — a little more if you can." :
                      "✓ Great detail — your analysis will be highly specific."}
                  </div>
                </div>
              ) : null}

              <button
                onClick={function() { setStep(4); }}
                disabled={!archetype || (isOtherSelected && !archetypeOther.trim())}
                style={{
                  background: (!archetype || (isOtherSelected && !archetypeOther.trim())) ? S.card2 : S.accent,
                  color: (!archetype || (isOtherSelected && !archetypeOther.trim())) ? S.dim : "#ffffff",
                  border: "1px solid " + ((!archetype || (isOtherSelected && !archetypeOther.trim())) ? S.border : S.accent),
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 15,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: (!archetype || (isOtherSelected && !archetypeOther.trim())) ? "not-allowed" : "pointer",
                  letterSpacing: "0.08em",
                  width: "100%",
                }}
              >
                CONTINUE →
              </button>

          <button
            onClick={function() { setStep(2); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 4) {
    var exitRisk = sliderKM >= 7 && sliderTH <= 3;
    var cardStyle = {
      background: S.card,
      border: "1px solid " + S.border,
      borderRadius: 12,
      padding: "20px 22px",
      marginBottom: 16,
    };
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <style>{sliderCSS}</style>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 4 OF 8 — YOUR DEFENSIBILITY INPUTS
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "50%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Rate your business on four dimensions
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Be honest — this is for your eyes only. The more accurate your inputs, the more useful your results.
          </p>

          <div style={cardStyle}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              If a potential customer asked why they should hire you instead of using an AI tool plus a cheap offshore assistant — how sharp and specific is your answer?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderVP}
              onChange={function(e) { setSliderVP(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Struggling to answer</span>
              <span>Sharp and specific</span>
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              If you raised your prices by 20% tomorrow, what fraction of your customers would stay?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderCS}
              onChange={function(e) { setSliderCS(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Most would leave</span>
              <span>Almost none would leave</span>
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              How much of what makes your business work lives in your head and your relationships — versus being documented and transferable to someone else?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderKM}
              onChange={function(e) { setSliderKM(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Fully documented</span>
              <span>Almost all in my head</span>
            </div>
          </div>

          <div style={Object.assign({}, cardStyle, { marginBottom: exitRisk ? 8 : 24 })}>
            <p style={{ fontSize: 15, color: S.text, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 500 }}>
              What is your planning horizon for this business?
            </p>
            <input
              type="range"
              className="sb-slider"
              min={1}
              max={10}
              value={sliderTH}
              onChange={function(e) { setSliderTH(Number(e.target.value)); }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: S.dim }}>
              <span>Exiting within 24 months</span>
              <span>10+ years</span>
            </div>
            <p style={{ fontSize: 13, color: S.dim, lineHeight: 1.5, margin: "14px 0 0", fontStyle: "italic" }}>
              This doesn't affect your score — it shapes which recommendations you receive.
            </p>
          </div>

          {exitRisk ? (
            <div style={{
              background: "#fff7ed",
              border: "1px solid #ea580c",
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 24,
              marginTop: 8,
            }}>
              <p style={{ fontSize: 14, color: "#9a3412", lineHeight: 1.6, margin: 0 }}>
                ⚠ Exit Risk detected — you have concentrated value in yourself but a short time horizon. Any buyer will discount heavily for this. We'll factor this into your recommendations.
              </p>
            </div>
          ) : null}

          <button
            onClick={function() { setStep(45); }}
            style={{
              background: S.accent,
              color: "#ffffff",
              border: "1px solid " + S.accent,
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(3); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 45) {
    var allAnswered = bizGoal && bizAge && bizLocation &&
      bizChannels.length > 0 && bizTech &&
      bizCustomerSpread && bizDiff &&
      (!bizChannels.includes("other_channel") ||
        bizChannelOther.trim());

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 4.5 OF 8 — YOUR BUSINESS CONTEXT
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "56%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Help us understand your business better.
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 40px" }}>
            These answers sharpen your risk analysis and recommendations significantly.
          </p>

          {/* Q1 — Business Goal */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>YOUR GOAL FOR THIS BUSINESS</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>What are you trying to do with this business over the next few years?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIZ_GOALS.map(function(o) {
                var sel = bizGoal === o.id;
                return (
                  <button key={o.id} onClick={function() { setBizGoal(o.id); }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: sel ? "#fff" : S.text }}>{o.label}</div>
                    <div style={{ fontSize: 13, color: sel ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 3 }}>{o.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q2 — Age */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>YOUR AGE</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>Which age bracket are you in?</div>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {BIZ_AGES.map(function(o) {
                var sel = bizAge === o.id;
                return (
                  <button key={o.id} onClick={function() { setBizAge(o.id); }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: sel ? "#fff" : S.text, whiteSpace: "nowrap" }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q3 — Location */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>WHERE YOU OPERATE</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>Where does your business primarily operate?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIZ_LOCATIONS.map(function(o) {
                var sel = bizLocation === o.id;
                return (
                  <button key={o.id} onClick={function() { setBizLocation(o.id); }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 600, color: sel ? "#fff" : S.text }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q4 — Channels (multi-select) */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>HOW CUSTOMERS FIND YOU</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>How do most new customers find your business? Select all that apply.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIZ_CHANNELS.map(function(o) {
                var sel = bizChannels.includes(o.id);
                return (
                  <button key={o.id} onClick={function() {
                    setBizChannels(function(prev) {
                      return sel ? prev.filter(function(c) { return c !== o.id; }) : prev.concat(o.id);
                    });
                  }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 600, color: sel ? "#fff" : S.text }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
            {bizChannels.includes("other_channel") && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={bizChannelOther}
                  onChange={function(e) { setBizChannelOther(e.target.value); }}
                  placeholder="Describe how customers find you..."
                  rows={2}
                  style={{ width: "100%", padding: "12px 14px", fontSize: 15, fontFamily: S.font, border: "1px solid " + S.border, borderRadius: 10, outline: "none", boxSizing: "border-box", resize: "vertical", color: S.text, background: S.card }}
                />
              </div>
            )}
          </div>

          {/* Q5 — Tech */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>YOUR RELATIONSHIP WITH NEW TECHNOLOGY</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>When a new tool could save you time or money, what do you usually do?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIZ_TECH.map(function(o) {
                var sel = bizTech === o.id;
                return (
                  <button key={o.id} onClick={function() { setBizTech(o.id); }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: sel ? "#fff" : S.text }}>{o.label}</div>
                    <div style={{ fontSize: 13, color: sel ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 3 }}>{o.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q6 — Customer Spread */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>YOUR CUSTOMER BASE</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>How spread out is your customer base?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIZ_CUSTOMER_SPREAD.map(function(o) {
                var sel = bizCustomerSpread === o.id;
                return (
                  <button key={o.id} onClick={function() { setBizCustomerSpread(o.id); }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: sel ? "#fff" : S.text }}>{o.label}</div>
                    <div style={{ fontSize: 13, color: sel ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 3 }}>{o.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q7 — Differentiator */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>WHAT MAKES YOU DIFFERENT</div>
            <div style={{ fontSize: 17, fontFamily: S.serif, color: S.text, marginBottom: 16, lineHeight: 1.4 }}>How would you honestly describe what makes your offering different from alternatives?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIZ_DIFF.map(function(o) {
                var sel = bizDiff === o.id;
                return (
                  <button key={o.id} onClick={function() { setBizDiff(o.id); }}
                    style={{ background: sel ? S.accent : S.card, border: "1px solid " + (sel ? S.accent : S.border), borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: sel ? "#fff" : S.text }}>{o.label}</div>
                    <div style={{ fontSize: 13, color: sel ? "rgba(255,255,255,0.65)" : S.dim, marginTop: 3 }}>{o.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={function() { setStep(5); }}
            disabled={!allAnswered}
            style={{
              background: !allAnswered ? S.card2 : S.accent,
              color: !allAnswered ? S.dim : "#ffffff",
              border: "1px solid " + (!allAnswered ? S.border : S.accent),
              borderRadius: 12, padding: "16px 32px", fontSize: 15,
              fontFamily: S.mono, fontWeight: 700,
              cursor: !allAnswered ? "not-allowed" : "pointer",
              letterSpacing: "0.08em", width: "100%",
            }}>
            CONTINUE →
          </button>

          <button onClick={function() { setStep(4); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}>
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 5) {
    function startEdit(item) {
      setEditDraft(item.text);
      setSnapshot(snapshot.map(function(s) {
        return { id: s.id, text: s.text, wrong: s.wrong, editing: s.id === item.id };
      }));
    }

    function saveEdit(id) {
      setSnapshot(snapshot.map(function(s) {
        if (s.id === id) {
          return { id: s.id, text: editDraft.trim() || s.text, wrong: s.wrong, editing: false };
        }
        return { id: s.id, text: s.text, wrong: s.wrong, editing: false };
      }));
    }

    function toggleWrong(id) {
      setSnapshot(snapshot.map(function(s) {
        if (s.id === id) {
          return { id: s.id, text: s.text, wrong: !s.wrong, editing: s.editing };
        }
        return s;
      }));
    }

    function addSentence() {
      if (!newSentence.trim()) return;
      setSnapshot(snapshot.concat([{
        id: "s" + Date.now(),
        text: newSentence.trim(),
        wrong: false,
        editing: false,
      }]));
      setNewSentence("");
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 5 OF 8 — YOUR COMPETITIVE LANDSCAPE
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "62.5%", background: S.accent, borderRadius: 2 }} />
          </div>

          {snapshotLoading ? (
            <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
              Analyzing your competitive landscape…
            </p>
          ) : null}

          {snapshotError ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 16, color: S.red, lineHeight: 1.6, margin: "0 0 16px" }}>
                {snapshotError}
              </p>
              <button
                onClick={fetchSnapshot}
                style={{
                  background: S.accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 14,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                TRY AGAIN
              </button>
            </div>
          ) : null}

          {!snapshotLoading && !snapshotError && snapshot.length > 0 ? (
            <>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
                Does this sound like your business?
              </h2>

              <div style={{
                background: "#eff6ff",
                border: "1px solid #2563eb",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 28,
                marginTop: 24,
              }}>
                <p style={{ fontSize: 14, color: "#1e40af", lineHeight: 1.6, margin: 0 }}>
                  This snapshot is AI-generated based on your inputs and general industry patterns. It is not based on real-time market research. Edit it to reflect your actual situation — your edits sharpen the scoring in the next step.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {snapshot.map(function(item) {
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: S.card,
                        border: "1px solid " + S.border,
                        borderRadius: 12,
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {item.editing ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="text"
                            value={editDraft}
                            onChange={function(e) { setEditDraft(e.target.value); }}
                            onKeyDown={function(e) {
                              if (e.key === "Enter") saveEdit(item.id);
                            }}
                            onBlur={function() { saveEdit(item.id); }}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: "10px 12px",
                              fontSize: 15,
                              fontFamily: S.font,
                              border: "1px solid " + S.border,
                              borderRadius: 8,
                              outline: "none",
                              boxSizing: "border-box",
                              color: S.text,
                              background: S.card,
                            }}
                          />
                          <button
                            onMouseDown={function(e) { e.preventDefault(); }}
                            onClick={function() { saveEdit(item.id); }}
                            style={{
                              background: S.accent,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 8,
                              padding: "10px 16px",
                              fontSize: 13,
                              fontFamily: S.mono,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.06em",
                              flexShrink: 0,
                            }}
                          >
                            SAVE
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
                          <span
                            onClick={function() { startEdit(item); }}
                            style={{
                              fontSize: 15,
                              color: item.wrong ? S.dim : S.text,
                              lineHeight: 1.55,
                              flex: 1,
                              cursor: "pointer",
                              textDecoration: item.wrong ? "line-through" : "none",
                              opacity: item.wrong ? 0.55 : 1,
                            }}
                          >
                            {item.text}
                          </span>
                          <button
                            onClick={function() { toggleWrong(item.id); }}
                            style={{
                              background: item.wrong ? "#fef2f2" : S.card2,
                              color: item.wrong ? S.red : S.dim,
                              border: "1px solid " + (item.wrong ? S.red : S.border),
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 11,
                              fontFamily: S.mono,
                              fontWeight: 600,
                              cursor: "pointer",
                              letterSpacing: "0.04em",
                              flexShrink: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.wrong ? "Marked wrong" : "Mark as wrong"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                <input
                  type="text"
                  value={newSentence}
                  onChange={function(e) { setNewSentence(e.target.value); }}
                  onKeyDown={function(e) {
                    if (e.key === "Enter") addSentence();
                  }}
                  placeholder="Add a sentence"
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    fontSize: 15,
                    fontFamily: S.font,
                    border: "1px solid " + S.border,
                    borderRadius: 10,
                    outline: "none",
                    boxSizing: "border-box",
                    color: S.text,
                    background: S.card,
                  }}
                />
                <button
                  onClick={addSentence}
                  disabled={!newSentence.trim()}
                  style={{
                    background: !newSentence.trim() ? S.card2 : S.accent,
                    color: !newSentence.trim() ? S.dim : "#ffffff",
                    border: "1px solid " + (!newSentence.trim() ? S.border : S.accent),
                    borderRadius: 10,
                    padding: "12px 20px",
                    fontSize: 13,
                    fontFamily: S.mono,
                    fontWeight: 700,
                    cursor: !newSentence.trim() ? "not-allowed" : "pointer",
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                  }}
                >
                  ADD
                </button>
              </div>
            </>
          ) : null}

          {!snapshotLoading ? (
            <>
              <p style={{ fontSize: 13, color: S.dim, lineHeight: 1.5, margin: "0 0 16px", fontStyle: "italic" }}>
                Your edits will recalibrate the scoring in the next step.
              </p>

              <button
                onClick={function() { setStep(6); }}
                style={{
                  background: S.accent,
                  color: "#ffffff",
                  border: "1px solid " + S.accent,
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 15,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  width: "100%",
                }}
              >
                CONTINUE →
              </button>
            </>
          ) : null}

          <button
            onClick={function() { setStep(4); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 6) {
    var overallScore = calcOverallScore(sliderVP, sliderCS, sliderKM);
    var subScores = calcSubScores(sliderVP, sliderCS, sliderKM);
    var scoreColor = getScoreColor(overallScore);
    var scoreLabel = getScoreLabel(overallScore);
    var flags = getDiagnosticFlags(sliderVP, sliderCS, sliderKM, sliderTH, snapshot);
    var subScoreItems = [
      { label: "Value Defensibility", value: subScores.valueD, description: "How clearly your business answers the question: why hire you instead of an AI tool?" },
      { label: "Customer Defensibility", value: subScores.customerD, description: "How likely your customers are to stay if you raise prices or a competitor appears." },
      { label: "Operational Defensibility", value: subScores.operationalD, description: "How much of your business value lives in documented systems versus your personal knowledge and relationships." },
    ];

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 6 OF 8 — YOUR SCORE
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "75%", background: S.accent, borderRadius: 2 }} />
          </div>

          <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
            Your defensibility score
          </h2>
          <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 32px" }}>
            Based on your inputs and competitive landscape edits.
          </p>

          <div style={{
            background: S.card,
            border: "1px solid " + S.border,
            borderRadius: 16,
            padding: "36px 32px",
            textAlign: "center",
            marginBottom: 32,
          }}>
            <div style={{
              fontFamily: S.serif,
              fontSize: 72,
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1,
              marginBottom: 12,
            }}>
              {overallScore}
            </div>
            <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.6, margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              {scoreLabel}
            </p>
          </div>

          <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.7, margin: "16px 0 28px" }}>
            Your Defensible Zone™ score reflects how well your business is positioned to survive and grow in an AI-saturated market. A higher score means your value is harder to replicate, your customers are harder to poach, and your business model has real staying power. A lower score is not a verdict — it is a map of where to focus.
          </p>

          <div style={{ marginBottom: 32 }}>
            {subScoreItems.map(function(item) {
              var barColor = getScoreColor(item.value);
              return (
                <div key={item.label} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{item.label}</span>
                    <span style={{ fontFamily: S.mono, fontSize: 13, fontWeight: 700, color: barColor }}>{item.value}</span>
                  </div>
                  <div style={{ height: 8, background: S.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: item.value + "%", background: barColor, borderRadius: 4 }} />
                  </div>
                  <p style={{ fontSize: 13, color: S.dim, marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {flags.length > 0 ? (
            <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
              WHAT WE FOUND
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {flags.map(function(flag, i) {
                var isPositive = flag.type === "positive";
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      background: isPositive ? "#dcfce7" : "#fef3c7",
                      color: isPositive ? "#166534" : "#92400e",
                      fontSize: 13,
                      lineHeight: 1.4,
                      padding: "8px 14px",
                      borderRadius: 999,
                      fontWeight: 500,
                    }}
                  >
                    {isPositive ? "✓ " : "⚠ "}{flag.label}
                  </span>
                );
              })}
            </div>
            </div>
          ) : null}

          <button
            onClick={function() { setStep(7); }}
            style={{
              background: S.accent,
              color: "#ffffff",
              border: "1px solid " + S.accent,
              borderRadius: 12,
              padding: "16px 32px",
              fontSize: 15,
              fontFamily: S.mono,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              width: "100%",
            }}
          >
            CONTINUE →
          </button>

          <button
            onClick={function() { setStep(5); }}
            style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
          >
            ← BACK
          </button>

        </div>
      </div>
    );
  }

  if (step === 7) {
    var showExpiredInvalid = gateError === "expired" || gateError === "invalid";
    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            STEP 7 OF 8 — VERIFY YOUR EMAIL
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ height: "100%", width: "87.5%", background: S.accent, borderRadius: 2 }} />
          </div>

          {gateLoading && !gateSent ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ fontFamily: S.mono, fontSize: 14, color: S.muted, margin: 0 }}>
                Verifying…
              </p>
            </div>
          ) : gateSent && !gateVerified ? (
            <>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 12px", lineHeight: 1.2, fontWeight: 600 }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.75, margin: "0 0 24px" }}>
                {"We sent a link to " + gateEmail + ". Click it to continue — it expires in 15 minutes."}
              </p>
              {showResend ? (
                <button
                  type="button"
                  onClick={handleGateSubmit}
                  disabled={gateLoading}
                  style={{
                    background: "transparent",
                    border: "1px solid " + S.border,
                    borderRadius: 10,
                    padding: "12px 20px",
                    fontFamily: S.mono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: S.muted,
                    cursor: gateLoading ? "not-allowed" : "pointer",
                    letterSpacing: "0.06em",
                  }}
                >
                  Resend link
                </button>
              ) : null}
            </>
          ) : !gateSent ? (
            <>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, color: S.text, margin: "0 0 8px", lineHeight: 1.2, fontWeight: 600 }}>
                Where should we send your results?
              </h2>
              <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: "0 0 24px" }}>
                Enter your email. We&apos;ll send a verification link — click it to unlock your score and flags.
              </p>
              {gateError === "expired" ? (
                <p style={{ fontSize: 16, color: S.red, lineHeight: 1.6, margin: "0 0 16px" }}>
                  Your link has expired.
                </p>
              ) : null}
              {gateError === "invalid" ? (
                <p style={{ fontSize: 16, color: S.red, lineHeight: 1.6, margin: "0 0 16px" }}>
                  That link isn&apos;t valid.
                </p>
              ) : null}
              <input
                type="email"
                placeholder="your@email.com"
                value={gateEmail}
                onChange={function(e) {
                  setGateEmail(e.target.value);
                  if (showExpiredInvalid) setGateError("");
                }}
                disabled={gateLoading}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: S.font,
                  border: "1px solid " + S.border,
                  borderRadius: 10,
                  outline: "none",
                  boxSizing: "border-box",
                  color: S.text,
                  background: S.card,
                  marginBottom: 16,
                }}
              />
              {gateError && !showExpiredInvalid ? (
                <p style={{ fontSize: 14, color: S.red, lineHeight: 1.5, margin: "0 0 16px" }}>
                  {gateError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleGateSubmit}
                disabled={gateLoading}
                style={{
                  background: S.gold,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 15,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: gateLoading ? "not-allowed" : "pointer",
                  letterSpacing: "0.08em",
                  width: "100%",
                  opacity: gateLoading ? 0.7 : 1,
                }}
              >
                {showExpiredInvalid ? "Request a new link" : "SEND VERIFICATION LINK"}
              </button>
            </>
          ) : null}

          {!gateSent ? (
            <button
              type="button"
              onClick={function() { setStep(6); }}
              style={{ marginTop: 16, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: S.mono, fontSize: 12, color: S.dim, letterSpacing: "0.06em" }}
            >
              ← BACK
            </button>
          ) : null}

        </div>
      </div>
    );
  }

  if (step === 8) {
    var reportIndustryLabel = (SB_INDUSTRIES.find(function(i) { return i.id === industry; }) || {}).label || industry;
    var reportArchetypes = SB_ARCHETYPES[industry] || [];
    var reportArchetypeLabel = archetypeOther.trim() || (reportArchetypes.find(function(a) { return a.id === archetype; }) || {}).label || archetype;
    var reportOverallScore = calcOverallScore(sliderVP, sliderCS, sliderKM);
    var reportScoreColor = getScoreColor(reportOverallScore);
    var unlocked = tier >= 1 || promoUsed;

    function riskBadgeColor(idx) {
      if (idx === 0) return S.red;
      if (idx <= 2) return S.orange;
      return S.gold;
    }

    function riskBadgeLabel(idx) {
      if (idx === 0) return "#1 HIGHEST PRIORITY";
      return "#" + (idx + 1);
    }

    function renderRiskCard(risk, idx, blurred) {
      return (
        <div
          key={idx}
          style={{
            background: S.card,
            border: "1px solid " + S.border,
            borderRadius: 12,
            padding: "20px 22px",
            marginBottom: 12,
            filter: blurred ? "blur(5px)" : "none",
            userSelect: blurred ? "none" : "auto",
            pointerEvents: blurred ? "none" : "auto",
          }}
        >
          <div style={{
            fontFamily: S.mono,
            fontSize: 11,
            fontWeight: 700,
            color: riskBadgeColor(idx),
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}>
            {riskBadgeLabel(idx)}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 10, lineHeight: 1.3 }}>
            {risk.title}
          </div>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.dim, letterSpacing: "0.06em", marginBottom: 4 }}>
            WHY THIS RANK:
          </div>
          <p style={{ fontSize: 14, color: S.dim, fontStyle: "italic", lineHeight: 1.55, margin: "0 0 14px" }}>
            {risk.priority_rationale}
          </p>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: "0.06em", marginBottom: 4 }}>
            WHAT TO DO:
          </div>
          <p style={{ fontSize: 14, color: S.text, lineHeight: 1.6, margin: 0 }}>
            {risk.action}
          </p>
        </div>
      );
    }

    return (
      <div style={{ background: S.bg, minHeight: "100vh", fontFamily: S.font }}>
        <SBNavbar />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", boxSizing: "border-box" }}>

          <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
            COMPLETE — YOUR DEFENSIBILITY REPORT
          </div>
          <div style={{ height: 4, background: S.border, borderRadius: 2, overflow: "hidden", marginBottom: 40 }}>
            <div style={{ height: "100%", width: "100%", background: S.green, borderRadius: 2 }} />
          </div>

          {reportLoading ? (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <p style={{ fontFamily: S.serif, fontSize: 22, color: S.text, margin: "0 0 12px", fontWeight: 600 }}>
                Generating your Defensibility Report…
              </p>
              <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: 0, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                This takes about 15 seconds — we are analyzing your full profile.
              </p>
            </div>
          ) : null}

          {reportError ? (
            <div style={{ textAlign: "center", padding: "48px 24px", marginBottom: 32 }}>
              <p style={{ fontSize: 16, color: S.red, lineHeight: 1.6, margin: "0 0 20px" }}>
                {reportError}
              </p>
              <button
                onClick={fetchReport}
                style={{
                  background: S.accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 28px",
                  fontSize: 14,
                  fontFamily: S.mono,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                TRY AGAIN
              </button>
            </div>
          ) : null}

          {report && !reportLoading ? (
            <>
              <div style={{ marginBottom: 40 }}>
                <div style={{
                  fontFamily: S.mono,
                  fontSize: 11,
                  color: S.gold,
                  letterSpacing: "0.14em",
                  marginBottom: 16,
                  fontWeight: 600,
                }}>
                  DEFENSIBLE ZONE™ · SMALL BUSINESS OWNER EDITION
                </div>
                <h1 style={{
                  fontFamily: S.serif,
                  fontSize: 36,
                  color: S.text,
                  margin: "0 0 12px",
                  lineHeight: 1.2,
                  fontWeight: 600,
                }}>
                  Your Defensibility Report
                </h1>
                <p style={{ fontSize: 16, color: S.dim, lineHeight: 1.6, margin: 0 }}>
                  {reportIndustryLabel + " · " + reportArchetypeLabel + " · Overall score: "}
                  <span style={{ fontWeight: 700, color: reportScoreColor }}>{reportOverallScore + "/100"}</span>
                </p>
              </div>

              <div style={{ marginBottom: 36 }}>
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                  SCORE IN CONTEXT
                </div>
                <div style={{
                  background: S.card,
                  border: "1px solid " + S.border,
                  borderRadius: 12,
                  padding: "20px 22px",
                }}>
                  <p style={{ fontSize: 15, color: S.text, lineHeight: 1.7, margin: 0 }}>
                    {report.section1}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 36 }}>
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                  YOUR TOP 5 RISKS — PRIORITIZED
                </div>

                {(report.section2 || []).length > 0 ? renderRiskCard(report.section2[0], 0, false) : null}

                {(report.section2 || []).length > 1 && tier === 0 ? (
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    {(report.section2 || []).slice(1).map(function(risk, i) {
                      return renderRiskCard(risk, i + 1, true);
                    })}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "24px",
                      boxSizing: "border-box",
                    }}>
                      <div style={{
                        background: S.card,
                        border: "1px solid " + S.border,
                        borderRadius: 16,
                        padding: "32px 28px",
                        maxWidth: 720,
                        width: "100%",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      }}>
                        <h3 style={{ fontFamily: S.serif, fontSize: 24, color: S.text, margin: "0 0 10px", fontWeight: 600, textAlign: "center" }}>
                          Your full report is ready.
                        </h3>
                        <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.65, margin: "0 0 20px", textAlign: "center" }}>
                          Unlock all 5 risks, your strongest anchors, your strategic question, and your priority first move.
                        </p>
                        <p style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, textAlign: "center", margin: "0 0 28px", letterSpacing: "0.04em" }}>
                          {"Everything will be emailed to " + gateEmail}
                        </p>

                        <div style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 16,
                          alignItems: "stretch",
                          marginBottom: 24,
                          flexWrap: "nowrap",
                        }}>
                          <div style={{
                            flex: "1 1 0",
                            minWidth: 0,
                            border: "1px solid " + S.border,
                            borderRadius: 16,
                            padding: "24px 20px",
                            background: S.card,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}>
                            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", marginBottom: 4 }}>TIER 1</div>
                            <div style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 700, color: S.text, marginBottom: 2 }}>$99</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 14 }}>The Report</div>
                            <ul style={{ fontSize: 13, color: S.dim, lineHeight: 1.55, margin: "0 0 20px", paddingLeft: 18, flex: 1 }}>
                              <li>Full 5-section Defensibility Report</li>
                              <li>All 5 risks with priority rationale and actions</li>
                              <li>Your strongest anchors</li>
                              <li>Strategic reframing question</li>
                              <li>Priority first move</li>
                              <li>PDF emailed to you</li>
                            </ul>
                            <button type="button" style={{
                              background: S.accent,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 10,
                              padding: "14px 16px",
                              fontSize: 12,
                              fontFamily: S.mono,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.06em",
                              width: "100%",
                            }}
                            onClick={function() { handleUnlockCheckout(1); }}
                            disabled={checkoutLoading !== false}>
                              {checkoutLoading === 1 ? "Starting checkout…" : "UNLOCK REPORT → $99"}
                            </button>
                          </div>

                          <div style={{
                            flex: "1 1 0",
                            minWidth: 0,
                            border: "2px solid " + S.purple,
                            borderRadius: 16,
                            padding: "24px 20px",
                            background: S.card,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                          }}>
                            <div style={{
                              position: "absolute",
                              top: -12,
                              left: "50%",
                              transform: "translateX(-50%)",
                              background: S.purple,
                              color: "#ffffff",
                              fontFamily: S.mono,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "4px 12px",
                              borderRadius: 999,
                              letterSpacing: "0.06em",
                              whiteSpace: "nowrap",
                            }}>
                              ★ MOST POPULAR
                            </div>
                            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", marginBottom: 4, marginTop: 8 }}>TIER 2</div>
                            <div style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 700, color: S.text, marginBottom: 2 }}>$199</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 14 }}>Report + Strategy Session</div>
                            <ul style={{ fontSize: 13, color: S.dim, lineHeight: 1.55, margin: "0 0 20px", paddingLeft: 18, flex: 1 }}>
                              <li>Everything in Tier 1, plus:</li>
                              <li>30-minute 1:1 strategy session with Dilip</li>
                              <li>Focused on your top 2 risks</li>
                              <li>Session notes emailed after</li>
                            </ul>
                            <button type="button" style={{
                              background: S.purple,
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 10,
                              padding: "14px 16px",
                              fontSize: 12,
                              fontFamily: S.mono,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.06em",
                              width: "100%",
                            }}
                            onClick={function() { handleUnlockCheckout(2); }}
                            disabled={checkoutLoading !== false}>
                              {checkoutLoading === 2 ? "Starting checkout…" : "UNLOCK + BOOK SESSION → $199"}
                            </button>
                          </div>

                          <div style={{
                            flex: "1 1 0",
                            minWidth: 0,
                            border: "1px solid " + S.border,
                            borderRadius: 16,
                            padding: "24px 20px",
                            background: S.card,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}>
                            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.06em", marginBottom: 4 }}>TIER 3</div>
                            <div style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 700, color: S.text, marginBottom: 2 }}>$349</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 14 }}>Full Strategic Roadmap</div>
                            <ul style={{ fontSize: 13, color: S.dim, lineHeight: 1.55, margin: "0 0 20px", paddingLeft: 18, flex: 1 }}>
                              <li>Everything in Tier 2, plus:</li>
                              <li>60-minute strategic roadmap session</li>
                              <li>Written 2-3 page roadmap document</li>
                              <li>Delivered within 5 business days</li>
                            </ul>
                            <button type="button" style={{
                              background: S.gold,
                              color: S.text,
                              border: "none",
                              borderRadius: 10,
                              padding: "14px 16px",
                              fontSize: 12,
                              fontFamily: S.mono,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.06em",
                              width: "100%",
                            }}
                            onClick={function() { handleUnlockCheckout(3); }}
                            disabled={checkoutLoading !== false}>
                              {checkoutLoading === 3 ? "Starting checkout…" : "UNLOCK FULL ROADMAP → $349"}
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: "center", marginTop: 24 }}>
                          <button
                            type="button"
                            onClick={function() { setShowPromo(!showPromo); }}
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              fontFamily: S.mono,
                              fontSize: 12,
                              color: S.dim,
                              textDecoration: "underline",
                            }}
                          >
                            Have a promo code?
                          </button>
                          {showPromo ? (
                            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
                              <input
                                type="text"
                                value={promoCode}
                                onChange={function(e) { setPromoCode(e.target.value); setPromoError(""); }}
                                placeholder="Enter code"
                                style={{
                                  padding: "10px 14px",
                                  fontSize: 14,
                                  fontFamily: S.mono,
                                  border: "1px solid " + S.border,
                                  borderRadius: 8,
                                  outline: "none",
                                  minWidth: 160,
                                }}
                              />
                              <button
                                type="button"
                                onClick={applyPromoCode}
                                style={{
                                  background: S.accent,
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "10px 20px",
                                  fontFamily: S.mono,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                APPLY
                              </button>
                            </div>
                          ) : null}
                          {promoError ? (
                            <p style={{ fontSize: 13, color: S.red, marginTop: 8, marginBottom: 0 }}>{promoError}</p>
                          ) : null}
                          {checkoutError ? (
                            <p style={{ fontSize: 13, color: "#dc2626", marginTop: 8, textAlign: "center" }}>{checkoutError}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {(report.section2 || []).length > 1 && tier !== 0 ? (
                  (report.section2 || []).slice(1).map(function(risk, i) {
                    return renderRiskCard(risk, i + 1, false);
                  })
                ) : null}
              </div>

              {unlocked ? (
                <>
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                      YOUR STRONGEST ANCHORS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(report.section3 || []).map(function(anchor, i) {
                        return (
                          <div
                            key={i}
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #86efac",
                              borderRadius: 12,
                              padding: "16px 18px",
                            }}
                          >
                            <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 6 }}>
                              {"✓ " + anchor.title}
                            </div>
                            <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.55, margin: 0 }}>
                              {anchor.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 36 }}>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                      THE STRATEGIC QUESTION
                    </div>
                    <div style={{
                      background: S.card,
                      border: "1px solid " + S.border,
                      borderLeft: "4px solid " + S.gold,
                      borderRadius: 12,
                      padding: "24px 22px",
                    }}>
                      <p style={{
                        fontFamily: S.serif,
                        fontSize: 22,
                        color: S.text,
                        lineHeight: 1.4,
                        margin: "0 0 16px",
                        fontWeight: 600,
                      }}>
                        {report.section4 && report.section4.question}
                      </p>
                      <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.65, margin: 0 }}>
                        {report.section4 && report.section4.context}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 36 }}>
                    <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                      WHAT TO DO FIRST
                    </div>
                    <div style={{
                      background: S.accent,
                      borderRadius: 12,
                      padding: "24px 22px",
                    }}>
                      <p style={{ fontSize: 17, color: "#ffffff", lineHeight: 1.7, margin: 0 }}>
                        {report.section5}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}

              {(tier >= 1 || promoUsed || sessionPromo) && report && report.section6 ? (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.red, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                    AI THREAT TIMELINE
                  </div>
                  <div style={{ display: "flex", flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                    {[
                      { label: "12 MONTHS", key: "months12" },
                      { label: "24 MONTHS", key: "months24" },
                      { label: "36 MONTHS", key: "months36" },
                    ].map(function(period) {
                      return (
                        <div
                          key={period.key}
                          style={{
                            flex: "1 1 0",
                            minWidth: 180,
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 12,
                            padding: "16px 18px",
                          }}
                        >
                          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.red, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 10 }}>
                            {period.label}
                          </div>
                          <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.55, margin: 0 }}>
                            {report.section6[period.key]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {(tier >= 1 || promoUsed || sessionPromo) && report && report.section7 ? (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                    COMPETITIVE ANALYSIS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "WHO YOU'RE COMPETING AGAINST", key: "competitors" },
                      { label: "WHAT AI IS ERODING RIGHT NOW", key: "eroding" },
                      { label: "DEFENSIBLE POSITIONS IN YOUR MARKET", key: "defensible" },
                    ].map(function(sub) {
                      return (
                        <div
                          key={sub.key}
                          style={{
                            background: S.card,
                            border: "1px solid " + S.border,
                            borderRadius: 12,
                            padding: "16px 18px",
                          }}
                        >
                          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.dim, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
                            {sub.label}
                          </div>
                          <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.55, margin: 0 }}>
                            {report.section7[sub.key]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {(tier >= 1 || promoUsed || sessionPromo) && report && report.section8 ? (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                    WHAT A BUYER WOULD SAY
                  </div>
                  <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 0", minWidth: 220 }}>
                      <div style={{ fontFamily: S.mono, fontSize: 10, color: S.green, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 10 }}>
                        WOULD PAY A PREMIUM FOR
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(report.section8.premium_factors || []).map(function(item, i) {
                          return (
                            <div
                              key={i}
                              style={{
                                background: "#f0fdf4",
                                border: "1px solid #86efac",
                                borderRadius: 12,
                                padding: "14px 16px",
                              }}
                            >
                              <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 4 }}>{item.title}</div>
                              <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ flex: "1 1 0", minWidth: 220 }}>
                      <div style={{ fontFamily: S.mono, fontSize: 10, color: S.red, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 10 }}>
                        WOULD DISCOUNT FOR
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(report.section8.discount_factors || []).map(function(item, i) {
                          return (
                            <div
                              key={i}
                              style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: 12,
                                padding: "14px 16px",
                              }}
                            >
                              <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 4 }}>{item.title}</div>
                              <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {(tier >= 1 || promoUsed || sessionPromo) && report && report.section9 ? (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                    OWNER DEPENDENCE ANALYSIS
                  </div>
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.55, margin: "0 0 14px" }}>
                    Your business currently depends on you personally in these specific ways:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(report.section9 || []).map(function(dep, i) {
                      return (
                        <div
                          key={i}
                          style={{
                            background: "#fefce8",
                            border: "1px solid #fde68a",
                            borderRadius: 12,
                            padding: "16px 18px",
                          }}
                        >
                          <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 6 }}>{dep.name}</div>
                          <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.55, margin: 0 }}>{dep.risk}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {(tier >= 1 || promoUsed || sessionPromo) && report && report.section10 ? (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                    COMPETITIVE BENCHMARK
                  </div>
                  <div style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 12,
                    padding: "16px 18px",
                    marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.6, margin: 0 }}>
                      {report.section10.typical_range}
                    </p>
                  </div>
                  <div style={{ fontFamily: S.mono, fontSize: 10, color: S.dim, letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
                    WHAT HIGH-SCORING BUSINESSES DO DIFFERENTLY
                  </div>
                  <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.6, margin: 0 }}>
                    {report.section10.differentiators}
                  </p>
                </div>
              ) : null}

              {(tier >= 2 || promoUsed || sessionPromo) && (
                <div style={{ background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: "32px", marginBottom: 24, textAlign: "center" }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.gold, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 12 }}>
                    YOUR NEXT STEP
                  </div>
                  {sessionPromo && tier < 2 ? (
                    <div>
                      <h3 style={{ fontFamily: S.serif, fontSize: 22, color: S.text, margin: "0 0 12px" }}>
                        You&apos;ve unlocked a complimentary 30-minute strategy session.
                      </h3>
                      <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: "0 0 24px" }}>
                        Book your session below. Come prepared with your top question about your business.
                      </p>
                      <a href="https://cal.com/dkchetan/company-strategy" target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", background: S.accent, color: "#ffffff", borderRadius: 12, padding: "16px 32px", fontFamily: S.mono, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" }}>
                        BOOK 30-MIN SESSION →
                      </a>
                    </div>
                  ) : tier === 2 || (promoUsed && tier < 3) ? (
                    <div>
                      <h3 style={{ fontFamily: S.serif, fontSize: 22, color: S.text, margin: "0 0 12px" }}>
                        You&apos;ve unlocked a 30-minute strategy session.
                      </h3>
                      <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: "0 0 24px" }}>
                        Book your time below. We&apos;ll work through your top 2 risks together.
                      </p>
                      <a href="https://cal.com/dkchetan/company-strategy" target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", background: S.purple, color: "#ffffff", borderRadius: 12, padding: "16px 32px", fontFamily: S.mono, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" }}>
                        BOOK 30-MIN STRATEGY SESSION →
                      </a>
                    </div>
                  ) : tier >= 3 ? (
                    <div>
                      <h3 style={{ fontFamily: S.serif, fontSize: 22, color: S.text, margin: "0 0 12px" }}>
                        You&apos;ve unlocked a 60-minute strategic roadmap session.
                      </h3>
                      <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, margin: "0 0 24px" }}>
                        Book your time below. We&apos;ll cover your competitive positioning, top risks, and build your written roadmap.
                      </p>
                      <a href="https://cal.com/dkchetan/company-roadmap" target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", background: S.gold, color: "#ffffff", borderRadius: 12, padding: "16px 32px", fontFamily: S.mono, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" }}>
                        BOOK 60-MIN ROADMAP SESSION →
                      </a>
                    </div>
                  ) : null}
                </div>
              )}

              {(tier >= 1 || promoUsed || sessionPromo) && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, color: S.dim, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 16 }}>
                    BOOK ADDITIONAL SESSIONS
                  </div>
                  <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "nowrap" }}>
                    <div style={{ flex: "1 1 0", minWidth: 0, background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: "24px 20px" }}>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>
                        30-MIN SESSION
                      </div>
                      <div style={{ fontFamily: S.serif, fontSize: 28, color: S.text, fontWeight: 700, marginBottom: 8 }}>$149</div>
                      <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.6, margin: "0 0 20px" }}>
                        A focused working session on one specific risk or decision in your business. Bring your top question.
                      </p>
                      <a href="https://cal.com/dkchetan/company-strategy" target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", background: S.accent, color: "#ffffff", borderRadius: 10, padding: "14px 20px", fontFamily: S.mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none", textAlign: "center" }}>
                        BOOK → $149
                      </a>
                    </div>
                    <div style={{ flex: "1 1 0", minWidth: 0, background: S.card, border: "1px solid " + S.border, borderRadius: 16, padding: "24px 20px" }}>
                      <div style={{ fontFamily: S.mono, fontSize: 11, color: S.muted, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>
                        60-MIN DEEP DIVE
                      </div>
                      <div style={{ fontFamily: S.serif, fontSize: 28, color: S.text, fontWeight: 700, marginBottom: 8 }}>$249</div>
                      <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.6, margin: "0 0 20px" }}>
                        Full working session on competitive positioning and top risks. Written action summary delivered within 48 hours.
                      </p>
                      <a href="https://cal.com/dkchetan/company-roadmap" target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", background: S.purple, color: "#ffffff", borderRadius: 10, padding: "14px 20px", fontFamily: S.mono, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none", textAlign: "center" }}>
                        BOOK → $249
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={resetAll}
                  style={{
                    background: "transparent",
                    border: "1px solid " + S.border,
                    borderRadius: 10,
                    padding: "12px 24px",
                    fontFamily: S.mono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: S.muted,
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                  }}
                >
                  START OVER
                </button>
              </div>
            </>
          ) : null}

        </div>
        <SBFooter />
      </div>
    );
  }

  return null;
}
