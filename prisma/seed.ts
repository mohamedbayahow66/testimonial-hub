import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper to generate random date within last 3 months
function randomDateInLast3Months(): Date {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime());
  return new Date(randomTime);
}

// Helper to generate random slug
function generateSlug(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

// Sample testimonial data
const testimonialTemplates = [
  {
    originalText: "This product has completely transformed our workflow. We've seen a 40% increase in productivity since implementing it. The customer support team is also incredibly responsive.",
    clientName: "Sarah Johnson",
    clientRole: "CEO at TechStartup Inc.",
    clientEmail: "sarah@techstartup.com",
  },
  {
    originalText: "Outstanding service! The team went above and beyond to meet our needs. I would highly recommend them to anyone looking for quality solutions.",
    clientName: "Michael Chen",
    clientRole: "Marketing Director at GlobalBrand",
    clientEmail: "michael@globalbrand.com",
  },
  {
    originalText: "We switched from a competitor and the difference is night and day. The interface is intuitive and the features are exactly what we needed.",
    clientName: "Emily Rodriguez",
    clientRole: "Product Manager at InnovateCo",
    clientEmail: "emily@innovateco.com",
  },
  {
    originalText: "Best investment we've made this year. Our conversion rates improved by 35% within the first month of using their testimonial widgets.",
    clientName: "David Kim",
    clientRole: "Founder at StartupXYZ",
    clientEmail: "david@startupxyz.com",
  },
  {
    originalText: "The AI cleaning feature is a game-changer. It takes our raw customer feedback and turns it into polished, professional testimonials.",
    clientName: "Amanda Foster",
    clientRole: "Head of Customer Success at CloudFirst",
    clientEmail: "amanda@cloudfirst.io",
  },
  {
    originalText: "I was skeptical at first, but the results speak for themselves. Our landing page conversion rate doubled after adding the testimonial carousel.",
    clientName: "James Wilson",
    clientRole: "Digital Marketing Manager",
    clientEmail: "james@marketing.co",
  },
  {
    originalText: "The verification badges add so much credibility to our testimonials. Customers trust verified reviews and it shows in our sales numbers.",
    clientName: "Lisa Thompson",
    clientRole: "E-commerce Director at ShopSmart",
    clientEmail: "lisa@shopsmart.com",
  },
  {
    originalText: "Simple to set up, easy to use, and the widgets look fantastic on our website. Exactly what we were looking for.",
    clientName: "Robert Martinez",
    clientRole: "Web Developer at AgencyPro",
    clientEmail: "robert@agencypro.com",
  },
  {
    originalText: "Our clients love how easy it is to submit testimonials. The collection links work perfectly and we get high-quality responses.",
    clientName: "Jennifer Lee",
    clientRole: "Client Relations Manager",
    clientEmail: "jennifer@clientfirst.com",
  },
  {
    originalText: "The analytics dashboard gives us great insights into which testimonials perform best. Data-driven decisions have improved our conversion by 28%.",
    clientName: "Christopher Brown",
    clientRole: "Growth Lead at ScaleUp",
    clientEmail: "chris@scaleup.io",
  },
  {
    originalText: "We manage testimonials for multiple brands and the organization features are fantastic. Everything is clean and well-structured.",
    clientName: "Michelle Garcia",
    clientRole: "Brand Manager at MultiCorp",
    clientEmail: "michelle@multicorp.com",
  },
  {
    originalText: "The video testimonial feature helped us stand out from competitors. Nothing beats seeing real customers share their experiences.",
    clientName: "Daniel Anderson",
    clientRole: "CEO at VideoFirst Media",
    clientEmail: "daniel@videofirst.com",
  },
  {
    originalText: "Setup was incredibly quick. We had our first widget embedded on our homepage within 15 minutes of signing up.",
    clientName: "Rachel White",
    clientRole: "Operations Manager at QuickStart",
    clientEmail: "rachel@quickstart.co",
  },
  {
    originalText: "The customization options are excellent. We matched the widget perfectly to our brand colors and fonts.",
    clientName: "Kevin Taylor",
    clientRole: "UI/UX Designer at DesignHub",
    clientEmail: "kevin@designhub.com",
  },
  {
    originalText: "Customer support is top-notch. They helped us migrate from our old system and answered all our questions promptly.",
    clientName: "Stephanie Moore",
    clientRole: "IT Manager at TechSolutions",
    clientEmail: "stephanie@techsolutions.com",
  },
  {
    originalText: "The free tier gave us everything we needed to get started. Upgrading to Pro was an easy decision once we saw the results.",
    clientName: "Brian Jackson",
    clientRole: "Freelance Consultant",
    clientEmail: "brian@freelance.com",
  },
  {
    originalText: "Integration with our existing tools was seamless. The API documentation is clear and well-organized.",
    clientName: "Nicole Davis",
    clientRole: "Technical Lead at IntegrateAll",
    clientEmail: "nicole@integrateall.com",
  },
  {
    originalText: "We've collected over 200 testimonials in just 2 months. The collection links make it so easy for customers to share their feedback.",
    clientName: "Mark Thompson",
    clientRole: "Customer Experience Director",
    clientEmail: "mark@cxpro.com",
  },
];

async function main() {
  console.log("🌱 Starting comprehensive database seed...\n");

  const passwordHash = await bcrypt.hash("TestPass123", 12);

  // ============================================
  // Create 3 test users with different tiers
  // ============================================
  console.log("👤 Creating test users...");

  const freeUser = await prisma.user.upsert({
    where: { email: "free@example.com" },
    update: {},
    create: {
      email: "free@example.com",
      passwordHash,
      name: "Alex Free",
      businessName: "Free Startup",
      subscriptionTier: "FREE",
      onboardingCompleted: true,
      brandingSettings: JSON.stringify({
        logoUrl: null,
        primaryColor: "#3b82f6",
        companyName: "Free Startup",
      }),
    },
  });
  console.log(`  ✅ Created FREE user: ${freeUser.email}`);

  const basicUser = await prisma.user.upsert({
    where: { email: "basic@example.com" },
    update: {},
    create: {
      email: "basic@example.com",
      passwordHash,
      name: "Jordan Basic",
      businessName: "Basic Solutions LLC",
      subscriptionTier: "BASIC",
      onboardingCompleted: true,
      brandingSettings: JSON.stringify({
        logoUrl: null,
        primaryColor: "#10b981",
        companyName: "Basic Solutions LLC",
      }),
    },
  });
  console.log(`  ✅ Created BASIC user: ${basicUser.email}`);

  const proUser = await prisma.user.upsert({
    where: { email: "pro@example.com" },
    update: {},
    create: {
      email: "pro@example.com",
      passwordHash,
      name: "Taylor Pro",
      businessName: "Pro Enterprise Corp",
      subscriptionTier: "PRO",
      onboardingCompleted: true,
      brandingSettings: JSON.stringify({
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#7c3aed",
        companyName: "Pro Enterprise Corp",
      }),
    },
  });
  console.log(`  ✅ Created PRO user: ${proUser.email}`);

  // Create a new user (for testing onboarding flow)
  const newUser = await prisma.user.upsert({
    where: { email: "new@example.com" },
    update: {},
    create: {
      email: "new@example.com",
      passwordHash,
      name: "New User",
      businessName: "New Company",
      subscriptionTier: "FREE",
      onboardingCompleted: false, // Not completed onboarding
      // brandingSettings is left undefined for new users
    },
  });
  console.log(`  ✅ Created NEW user (onboarding incomplete): ${newUser.email}`);

  const users = [freeUser, basicUser, proUser];

  // ============================================
  // Create testimonials for each user
  // ============================================
  console.log("\n📝 Creating testimonials...");

  // Delete existing testimonials for clean seed
  await prisma.testimonial.deleteMany({
    where: { userId: { in: users.map(u => u.id) } },
  });

  const statuses = ["APPROVED", "APPROVED", "APPROVED", "PENDING", "REJECTED"];
  const types = ["TEXT", "TEXT", "TEXT", "IMAGE", "VIDEO"];

  let testimonialCount = 0;
  for (const user of users) {
    // Distribute testimonials: FREE gets 5, BASIC gets 7, PRO gets 8
    const count = user.subscriptionTier === "FREE" ? 5 : user.subscriptionTier === "BASIC" ? 7 : 8;
    
    for (let i = 0; i < count; i++) {
      const template = testimonialTemplates[(testimonialCount + i) % testimonialTemplates.length];
      const status = statuses[i % statuses.length];
      const submissionType = types[i % types.length];
      const submittedAt = randomDateInLast3Months();
      
      await prisma.testimonial.create({
        data: {
          userId: user.id,
          status,
          originalText: template.originalText,
          cleanedText: status === "APPROVED" ? template.originalText.replace(/\. /g, ". ✨ ") : null,
          clientName: template.clientName,
          clientEmail: template.clientEmail,
          clientRole: template.clientRole,
          submissionType,
          mediaUrl: submissionType === "IMAGE" 
            ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400"
            : submissionType === "VIDEO" 
              ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              : null,
          verificationBadge: status === "APPROVED" && i % 3 === 0,
          verificationProof: status === "APPROVED" && i % 3 === 0 ? "Email verified via LinkedIn" : null,
          submittedAt,
          approvedAt: status === "APPROVED" ? new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000) : null,
        },
      });
      testimonialCount++;
    }
    console.log(`  ✅ Created ${count} testimonials for ${user.email}`);
  }

  // ============================================
  // Create collection links for each user
  // ============================================
  console.log("\n🔗 Creating collection links...");

  // Delete existing collection links for clean seed
  await prisma.collectionLink.deleteMany({
    where: { userId: { in: users.map(u => u.id) } },
  });

  const collectionLinkTemplates = [
    { title: "Share Your Experience", description: "We'd love to hear about your experience with our products and services." },
    { title: "Customer Feedback", description: "Your feedback helps us improve. Share your thoughts!" },
    { title: "Success Stories", description: "Tell us how we've helped your business succeed." },
  ];

  for (const user of users) {
    const linkCount = user.subscriptionTier === "FREE" ? 2 : 3;
    
    for (let i = 0; i < linkCount; i++) {
      const template = collectionLinkTemplates[i];
      const businessSlug = user.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      
      await prisma.collectionLink.create({
        data: {
          userId: user.id,
          slug: generateSlug(businessSlug),
          title: template.title,
          description: template.description,
          isActive: i === 0, // Only first link is active
          clickCount: Math.floor(Math.random() * 500) + 50,
        },
      });
    }
    console.log(`  ✅ Created ${linkCount} collection links for ${user.email}`);
  }

  // ============================================
  // Create widgets for each user
  // ============================================
  console.log("\n🎨 Creating widgets...");

  // Delete existing widgets for clean seed
  await prisma.widget.deleteMany({
    where: { userId: { in: users.map(u => u.id) } },
  });

  const widgetTemplates = [
    { name: "Homepage Carousel", type: "CAROUSEL" },
    { name: "Landing Page Grid", type: "GRID" },
    { name: "Sidebar List", type: "LIST" },
    { name: "Featured Testimonial", type: "SINGLE" },
  ];

  for (const user of users) {
    const widgetCount = user.subscriptionTier === "FREE" ? 1 : user.subscriptionTier === "BASIC" ? 3 : 4;
    const brandingSettings = user.brandingSettings ? JSON.parse(user.brandingSettings) : { primaryColor: "#7c3aed" };
    
    for (let i = 0; i < widgetCount; i++) {
      const template = widgetTemplates[i];
      
      await prisma.widget.create({
        data: {
          userId: user.id,
          name: template.name,
          widgetType: template.type,
          styling: JSON.stringify({
            primaryColor: brandingSettings.primaryColor || "#7c3aed",
            backgroundColor: "#ffffff",
            fontFamily: "Inter",
            borderRadius: "12px",
            showVerificationBadge: true,
          }),
          isActive: i === 0, // Only first widget is active
        },
      });
    }
    console.log(`  ✅ Created ${widgetCount} widgets for ${user.email}`);
  }

  // ============================================
  // Summary
  // ============================================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 Database seed completed successfully!");
  console.log("=".repeat(50));
  console.log("\n📋 Test credentials:");
  console.log("   FREE tier:  free@example.com / TestPass123");
  console.log("   BASIC tier: basic@example.com / TestPass123");
  console.log("   PRO tier:   pro@example.com / TestPass123");
  console.log("   NEW user:   new@example.com / TestPass123 (onboarding incomplete)");
  console.log("\n📊 Data created:");
  console.log(`   • 4 users (3 with completed onboarding, 1 new)`);
  console.log(`   • ${testimonialCount} testimonials`);
  console.log(`   • ${users.length * 2 + 1} collection links`);
  console.log(`   • ${1 + 3 + 4} widgets`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
