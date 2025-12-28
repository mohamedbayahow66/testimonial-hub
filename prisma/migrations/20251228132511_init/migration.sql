-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "brandingSettings" JSONB,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionLinkId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "originalText" TEXT NOT NULL,
    "displayText" TEXT,
    "cleanedText" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientRole" TEXT,
    "clientCompany" TEXT,
    "rating" INTEGER,
    "submissionType" TEXT NOT NULL DEFAULT 'TEXT',
    "mediaUrl" TEXT,
    "showFullName" BOOLEAN NOT NULL DEFAULT true,
    "allowPublic" BOOLEAN NOT NULL DEFAULT true,
    "verificationBadge" BOOLEAN NOT NULL DEFAULT false,
    "verificationProof" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "widgetType" TEXT NOT NULL DEFAULT 'GRID',
    "embedCode" TEXT NOT NULL,
    "styling" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Testimonial_userId_idx" ON "Testimonial"("userId");

-- CreateIndex
CREATE INDEX "Testimonial_status_idx" ON "Testimonial"("status");

-- CreateIndex
CREATE INDEX "Testimonial_collectionLinkId_idx" ON "Testimonial"("collectionLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "Widget_embedCode_key" ON "Widget"("embedCode");

-- CreateIndex
CREATE INDEX "Widget_userId_idx" ON "Widget"("userId");

-- CreateIndex
CREATE INDEX "Widget_embedCode_idx" ON "Widget"("embedCode");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionLink_slug_key" ON "CollectionLink"("slug");

-- CreateIndex
CREATE INDEX "CollectionLink_userId_idx" ON "CollectionLink"("userId");

-- CreateIndex
CREATE INDEX "CollectionLink_slug_idx" ON "CollectionLink"("slug");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_collectionLinkId_fkey" FOREIGN KEY ("collectionLinkId") REFERENCES "CollectionLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionLink" ADD CONSTRAINT "CollectionLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
