-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "thing_id" TEXT NOT NULL,
    "webhook_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_values" (
    "id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "property_id" UUID NOT NULL,
    "value_raw" TEXT NOT NULL,
    "value_number" DOUBLE PRECISION,
    "value_boolean" BOOLEAN,
    "value_string" TEXT,
    "persist" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_id_key" ON "devices"("device_id");

-- CreateIndex
CREATE INDEX "devices_device_id_idx" ON "devices"("device_id");

-- CreateIndex
CREATE INDEX "properties_device_id_name_idx" ON "properties"("device_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "properties_device_id_name_key" ON "properties"("device_id", "name");

-- CreateIndex
CREATE INDEX "property_values_device_id_property_id_updated_at_idx" ON "property_values"("device_id", "property_id", "updated_at");

-- CreateIndex
CREATE INDEX "property_values_device_id_updated_at_idx" ON "property_values"("device_id", "updated_at");

-- CreateIndex
CREATE INDEX "property_values_updated_at_idx" ON "property_values"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "property_values_event_id_property_id_updated_at_key" ON "property_values"("event_id", "property_id", "updated_at");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_values" ADD CONSTRAINT "property_values_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_values" ADD CONSTRAINT "property_values_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
