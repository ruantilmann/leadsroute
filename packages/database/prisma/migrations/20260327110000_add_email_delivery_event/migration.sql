-- CreateTable
CREATE TABLE "EmailDeliveryEvent" (
    "id" TEXT NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "messageId" VARCHAR(128),
    "eventType" VARCHAR(64) NOT NULL,
    "recipient" VARCHAR(255),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDeliveryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_eventType_idx" ON "EmailDeliveryEvent"("eventType");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_recipient_idx" ON "EmailDeliveryEvent"("recipient");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_occurredAt_idx" ON "EmailDeliveryEvent"("occurredAt");
