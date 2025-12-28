-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Testimonial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Testimonial_collectionLinkId_fkey" FOREIGN KEY ("collectionLinkId") REFERENCES "CollectionLink" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Testimonial" ("approvedAt", "cleanedText", "clientEmail", "clientName", "clientRole", "createdAt", "id", "mediaUrl", "originalText", "status", "submissionType", "submittedAt", "updatedAt", "userId", "verificationBadge", "verificationProof") SELECT "approvedAt", "cleanedText", "clientEmail", "clientName", "clientRole", "createdAt", "id", "mediaUrl", "originalText", "status", "submissionType", "submittedAt", "updatedAt", "userId", "verificationBadge", "verificationProof" FROM "Testimonial";
DROP TABLE "Testimonial";
ALTER TABLE "new_Testimonial" RENAME TO "Testimonial";
CREATE INDEX "Testimonial_userId_idx" ON "Testimonial"("userId");
CREATE INDEX "Testimonial_status_idx" ON "Testimonial"("status");
CREATE INDEX "Testimonial_collectionLinkId_idx" ON "Testimonial"("collectionLinkId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
