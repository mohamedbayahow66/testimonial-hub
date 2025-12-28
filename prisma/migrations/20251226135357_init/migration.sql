-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "brandingSettings" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "originalText" TEXT NOT NULL,
    "cleanedText" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientRole" TEXT,
    "submissionType" TEXT NOT NULL DEFAULT 'TEXT',
    "mediaUrl" TEXT,
    "verificationBadge" BOOLEAN NOT NULL DEFAULT false,
    "verificationProof" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "widgetType" TEXT NOT NULL DEFAULT 'GRID',
    "embedCode" TEXT NOT NULL,
    "styling" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Widget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
