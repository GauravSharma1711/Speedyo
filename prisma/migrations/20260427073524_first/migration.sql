-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('general', 'marketplace', 'feed', 'messaging', 'managed_sales', 'dashboard', 'other');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('new', 'reviewed', 'in_progress', 'resolved');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('draft', 'pending_signature', 'signed', 'cancelled');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('excellent', 'good', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('available', 'pending', 'sold', 'cancelled', 'hidden', 'unavailable');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('gasoline', 'diesel', 'hybrid', 'electric');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('manual', 'automatic', 'cvt');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('text', 'image', 'video', 'vehicle_promo');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('guest', 'private_seller', 'dealership');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('tier1', 'tier2', 'tier3', 'none');

-- CreateEnum
CREATE TYPE "DealershipVerificationStatus" AS ENUM ('not_submitted', 'pending_payment', 'pending_review', 'approved', 'declined');

-- CreateEnum
CREATE TYPE "DealershipSelectedTier" AS ENUM ('tier1', 'tier2', 'tier3');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('square', 'stripe');

-- CreateEnum
CREATE TYPE "GuestPurchaseStatus" AS ENUM ('pending_payment', 'payment_completed', 'activated', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "LiaisonAgreementStatus" AS ENUM ('draft', 'pending_signature', 'signed', 'terminated');

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('native_both', 'fluent_both', 'business_level');

-- CreateEnum
CREATE TYPE "LiaisonApplicationStatus" AS ENUM ('pending_review', 'under_review', 'approved', 'declined');

-- CreateEnum
CREATE TYPE "ManagedSaleStatus" AS ENUM ('pending_review', 'approved', 'declined', 'listed', 'sold', 'cancelled', 'cancellation_requested', 'edit_requested');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('inquiry', 'test_drive_request', 'general', 'system', 'confirmation_test_drive', 'test_drive_status_update');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_message', 'test_drive_request', 'test_drive_status_update', 'managed_sale_status', 'new_managed_sale_request', 'vehicle_edit_request', 'vehicle_edit_approved', 'vehicle_edit_declined', 'new_follower', 'post_like', 'comment_reply', 'managed_sale_edit_request', 'managed_sale_cancellation', 'test_drive_cancellation', 'account_status_update', 'dealership_approved', 'dealership_declined', 'new_post', 'new_vehicle_listing');

-- CreateEnum
CREATE TYPE "OISTVehicleCondition" AS ENUM ('excellent', 'good', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "OISTTradeInStatus" AS ENUM ('pending', 'contacted', 'quoted', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PhotographerAgreementStatus" AS ENUM ('draft', 'pending_signature', 'signed', 'terminated');

-- CreateEnum
CREATE TYPE "PhotographerApplicationStatus" AS ENUM ('pending_review', 'under_review', 'approved', 'declined');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('general', 'billing', 'technical', 'listing_issue');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "VehicleEditRequestStatus" AS ENUM ('pending', 'approved', 'declined');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('speedio_managed', 'self_service');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('in_progress', 'completed', 'on_hold');

-- CreateEnum
CREATE TYPE "VerificationRequestStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "bio" TEXT,
    "profile_image" TEXT,
    "user_type" "UserType" NOT NULL DEFAULT 'guest',
    "location" TEXT,
    "phone" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "dealership_verification_status" "DealershipVerificationStatus" NOT NULL DEFAULT 'not_submitted',
    "dealership_selected_tier" "DealershipSelectedTier",
    "business_name" TEXT,
    "business_address" TEXT,
    "business_city" TEXT,
    "business_state" TEXT,
    "business_zip" TEXT,
    "business_license_urls" TEXT[],
    "tax_id_number" TEXT,
    "verification_fee_paid" BOOLEAN NOT NULL DEFAULT false,
    "admin_verification_notes" TEXT,
    "welcome_email_sent" BOOLEAN NOT NULL DEFAULT false,
    "setup_completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_seller_slots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purchased" INTEGER NOT NULL DEFAULT 0,
    "used" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "private_seller_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'none',
    "expires_at" TIMESTAMP(3),
    "vehicles_sold_this_year" INTEGER NOT NULL DEFAULT 0,
    "square_subscription_id" TEXT,
    "square_customer_id" TEXT,

    CONSTRAINT "seller_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_follower_post" BOOLEAN NOT NULL DEFAULT true,
    "new_follower_vehicle" BOOLEAN NOT NULL DEFAULT true,
    "all_emails" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "email_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inapp_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_follower_post" BOOLEAN NOT NULL DEFAULT true,
    "new_follower_vehicle" BOOLEAN NOT NULL DEFAULT true,
    "all_notifications" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "inapp_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "images" TEXT[],
    "images_thumbnails" TEXT[],
    "images_small" TEXT[],
    "images_medium" TEXT[],
    "post_type" "PostType" NOT NULL DEFAULT 'text',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "engagement_score" INTEGER NOT NULL DEFAULT 0,
    "reactions" JSONB NOT NULL DEFAULT '{"like":0,"love":0,"wow":0,"fire":0,"laugh":0,"angry":0}',
    "user_reactions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "post_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "replies_count" INTEGER NOT NULL DEFAULT 0,
    "reactions" JSONB NOT NULL DEFAULT '{"like":0,"love":0,"wow":0,"fire":0,"laugh":0,"angry":0}',
    "user_reactions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "mileage" INTEGER,
    "condition" "VehicleCondition",
    "description" TEXT,
    "location" TEXT,
    "fuel_type" "FuelType",
    "transmission" "Transmission",
    "primary_image" TEXT,
    "primary_image_thumbnail" TEXT,
    "primary_image_small" TEXT,
    "primary_image_medium" TEXT,
    "images" TEXT[],
    "images_thumbnails" TEXT[],
    "images_small" TEXT[],
    "images_medium" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "website_managed" BOOLEAN NOT NULL DEFAULT false,
    "status" "VehicleStatus" NOT NULL DEFAULT 'available',
    "views" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "original_owner_id" TEXT,
    "dealership_name" TEXT,
    "recurring_availability" JSONB NOT NULL DEFAULT '[]',
    "booked_slots" JSONB NOT NULL DEFAULT '[]',
    "dealership_agreement_id" TEXT,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealership_vehicle_agreements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dealership_name" TEXT NOT NULL,
    "representative_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "license_number" TEXT,
    "service_fee_amount" DECIMAL(12,2),
    "status" "AgreementStatus" NOT NULL DEFAULT 'draft',
    "agreement_url" TEXT,
    "agreement_accepted" BOOLEAN NOT NULL DEFAULT false,
    "signed_by_name" TEXT,
    "signed_at" TIMESTAMP(3),
    "created_by_admin_id" TEXT,
    "admin_notes" TEXT,

    CONSTRAINT "dealership_vehicle_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "satisfaction_rating" INTEGER NOT NULL,
    "feedback_text" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "user_name" TEXT,
    "category" "FeedbackCategory" NOT NULL DEFAULT 'general',
    "status" "FeedbackStatus" NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" TEXT NOT NULL,
    "followed_id" TEXT NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_purchases" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_name" TEXT NOT NULL,
    "slots_purchased" INTEGER NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL,
    "payment_id" TEXT NOT NULL,
    "payment_gateway" "PaymentGateway" NOT NULL DEFAULT 'square',
    "promo_code_used" TEXT,
    "status" "GuestPurchaseStatus" NOT NULL DEFAULT 'pending_payment',
    "activated_at" TIMESTAMP(3),
    "activated_for_user_id" TEXT,

    CONSTRAINT "guest_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liaison_agreements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "agreement_title" TEXT NOT NULL DEFAULT 'Speedio Dealership Partnership Liaison Agreement',
    "position_title" TEXT NOT NULL DEFAULT 'Bilingual Dealership Liaison — Speedio Dealership Outreach Program',
    "fixed_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "residual_pay_percentage" DECIMAL(5,2) NOT NULL DEFAULT 3,
    "termination_notice_days" INTEGER NOT NULL DEFAULT 30,
    "agreement_start_date" TIMESTAMP(3),
    "agreement_end_date" TIMESTAMP(3),
    "status" "LiaisonAgreementStatus" NOT NULL DEFAULT 'draft',
    "agreement_url" TEXT,
    "created_by_admin_id" TEXT,
    "admin_notes" TEXT,
    "application_id" TEXT,

    CONSTRAINT "liaison_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liaison_applications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "language_proficiency" "LanguageProficiency" NOT NULL,
    "motivation" TEXT NOT NULL,
    "address" TEXT,
    "previous_experience" TEXT,
    "automotive_knowledge" TEXT,
    "availability" TEXT,
    "resume_url" TEXT,
    "status" "LiaisonApplicationStatus" NOT NULL DEFAULT 'pending_review',
    "admin_notes" TEXT,
    "reviewed_by_admin_id" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "liaison_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managed_sale_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "contact_full_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "vehicle_title" TEXT,
    "vehicle_make" TEXT,
    "vehicle_model" TEXT,
    "vehicle_year" INTEGER,
    "vehicle_mileage" INTEGER,
    "vehicle_condition" TEXT,
    "vehicle_description" TEXT,
    "vehicle_fuel_type" TEXT,
    "vehicle_transmission" TEXT,
    "vehicle_location" TEXT,
    "seller_asking_price" DECIMAL(12,2),
    "financing_available" TEXT,
    "warranty_available" TEXT,
    "warranty_link" TEXT,
    "vehicle_images" TEXT[],
    "vehicle_images_thumbnails" TEXT[],
    "vehicle_images_small" TEXT[],
    "vehicle_images_medium" TEXT[],
    "drive_type" TEXT,
    "engine_size" TEXT,
    "body_type" TEXT,
    "exterior_color" TEXT,
    "interior_color" TEXT,
    "doors" INTEGER,
    "seating_capacity" INTEGER,
    "steering_wheel" TEXT,
    "current_plate_type" TEXT,
    "shaken_valid_until" TEXT,
    "road_tax_paid" TEXT,
    "jci_insurance_valid_until" TEXT,
    "title_type" TEXT,
    "registration_location" TEXT,
    "engine_type" TEXT,
    "power_output" TEXT,
    "fuel_efficiency" TEXT,
    "drivetrain" TEXT,
    "suspension_type" TEXT,
    "brakes" TEXT,
    "tire_condition" TEXT,
    "battery_condition" TEXT,
    "hybrid_system_status" TEXT,
    "maintenance_history" TEXT,
    "power_sliding_doors" TEXT,
    "headlights" TEXT,
    "fog_lights" TEXT,
    "alloy_wheels" BOOLEAN,
    "spoiler" BOOLEAN,
    "tinted_windows" BOOLEAN,
    "roof_type" TEXT,
    "side_mirrors" TEXT,
    "body_condition" TEXT,
    "air_conditioning" TEXT,
    "upholstery" TEXT,
    "seat_type" TEXT,
    "seat_adjustments" TEXT,
    "navigation_system" TEXT,
    "rear_camera" BOOLEAN,
    "parking_sensors" TEXT,
    "power_windows" TEXT,
    "interior_lighting" TEXT,
    "cup_holders_storage" BOOLEAN,
    "child_lock_isofix" BOOLEAN,
    "display_screen_size" TEXT,
    "rear_entertainment_system" BOOLEAN,
    "digital_dashboard_display" BOOLEAN,
    "infotainment_system" TEXT[],
    "steering_wheel_controls" TEXT[],
    "airbags" TEXT[],
    "bluetooth" BOOLEAN,
    "usb_ports" BOOLEAN,
    "twelve_v_outlet" BOOLEAN,
    "smart_key_push_start" BOOLEAN,
    "keyless_entry" BOOLEAN,
    "remote_door_locking" BOOLEAN,
    "voice_command_hands_free" BOOLEAN,
    "abs" BOOLEAN,
    "esc_stability_control" BOOLEAN,
    "lane_departure_warning" BOOLEAN,
    "collision_mitigation" BOOLEAN,
    "cruise_control" TEXT,
    "traction_control" BOOLEAN,
    "hill_start_assist" BOOLEAN,
    "immobilizer_alarm" BOOLEAN,
    "seat_belt_sensors" BOOLEAN,
    "access_arrangements" JSONB NOT NULL DEFAULT '{}',
    "service_fee_amount" DECIMAL(12,2),
    "owner_receives_amount" DECIMAL(12,2),
    "final_sale_price_for_buyer" DECIMAL(12,2),
    "status" "ManagedSaleStatus" NOT NULL DEFAULT 'pending_review',
    "admin_notes" TEXT,
    "user_facing_notes" TEXT,
    "terms_agreed" BOOLEAN NOT NULL DEFAULT false,
    "cancellation_reason" TEXT,
    "edit_requests" JSONB NOT NULL DEFAULT '[]',
    "submitted_by_user_id" TEXT,
    "created_vehicle_id" TEXT,

    CONSTRAINT "managed_sale_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "conversation_id" TEXT,
    "message_type" "MessageType" NOT NULL DEFAULT 'general',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "translated_content" TEXT,
    "original_language" TEXT,
    "translated_to" TEXT,
    "vehicle_id" TEXT,
    "managed_sale_request_id" TEXT,
    "test_drive_details" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "content" TEXT NOT NULL,
    "sender_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "url" TEXT,
    "icon" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oist_trade_in_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "vehicle_make" TEXT NOT NULL,
    "vehicle_model" TEXT NOT NULL,
    "vehicle_year" TEXT NOT NULL,
    "vehicle_mileage" TEXT NOT NULL,
    "vehicle_condition" "OISTVehicleCondition" NOT NULL,
    "facebook_profile" TEXT,
    "additional_details" TEXT,
    "status" "OISTTradeInStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "oist_trade_in_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photographer_agreements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "agreement_title" TEXT NOT NULL DEFAULT 'Speedio Photographer Partnership Agreement',
    "position_title" TEXT NOT NULL DEFAULT 'Automotive Photographer - Speedio Platform',
    "fixed_percentage" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "termination_notice_days" INTEGER NOT NULL DEFAULT 30,
    "agreement_start_date" TIMESTAMP(3),
    "agreement_end_date" TIMESTAMP(3),
    "status" "PhotographerAgreementStatus" NOT NULL DEFAULT 'draft',
    "agreement_url" TEXT,
    "application_id" TEXT,
    "created_by_admin_id" TEXT,
    "admin_notes" TEXT,

    CONSTRAINT "photographer_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photographer_applications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photography_experience_years" INTEGER NOT NULL,
    "motivation" TEXT NOT NULL,
    "address" TEXT,
    "automotive_photography_experience" TEXT,
    "portfolio_url" TEXT,
    "equipment" TEXT,
    "availability" TEXT,
    "location_preferences" TEXT,
    "sample_work_urls" TEXT[],
    "status" "PhotographerApplicationStatus" NOT NULL DEFAULT 'pending_review',
    "admin_notes" TEXT,
    "reviewed_by_admin_id" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "photographer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ticket_type" "TicketType" NOT NULL DEFAULT 'general',
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    "assigned_to" TEXT,
    "resolution_notes" TEXT,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_edit_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "requested_by_user_id" TEXT NOT NULL,
    "requested_changes" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "VehicleEditRequestStatus" NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "processed_by_admin" TEXT,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_edit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_inspection_checklists" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date_of_inspection" TIMESTAMP(3) NOT NULL,
    "inspector_name" TEXT NOT NULL,
    "dealership_name" TEXT,
    "warranty" TEXT,
    "repair_service_details" TEXT,
    "verified_by_speedio" TEXT,
    "dealership_representative" TEXT,
    "inspection_notes" TEXT,
    "overall_condition" TEXT,
    "recommended_sale_price" DECIMAL(12,2),
    "vehicle_info" JSONB NOT NULL DEFAULT '{}',
    "exterior_condition" JSONB NOT NULL DEFAULT '[]',
    "interior_condition" JSONB NOT NULL DEFAULT '[]',
    "engine_mechanical" JSONB NOT NULL DEFAULT '[]',
    "documentation" JSONB NOT NULL DEFAULT '[]',
    "photos_media" JSONB NOT NULL DEFAULT '[]',
    "managed_sale_request_id" TEXT,

    CONSTRAINT "vehicle_inspection_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_transfers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "transfer_type" "TransferType" NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "steps_completed" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "initiated_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "status" "TransferStatus" NOT NULL DEFAULT 'in_progress',
    "admin_notes" TEXT,
    "user_facing_notes" TEXT,

    CONSTRAINT "vehicle_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "user_email" TEXT,
    "user_name" TEXT,
    "preferred_time" TEXT,
    "documents_info" TEXT,
    "inspection_notes" TEXT,
    "status" "VerificationRequestStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "private_seller_slots_user_id_key" ON "private_seller_slots"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seller_subscriptions_user_id_key" ON "seller_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_notifications_user_id_key" ON "email_notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "inapp_notifications_user_id_key" ON "inapp_notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_followed_id_key" ON "follows"("follower_id", "followed_id");

-- CreateIndex
CREATE UNIQUE INDEX "guest_purchases_payment_id_key" ON "guest_purchases"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "managed_sale_requests_created_vehicle_id_key" ON "managed_sale_requests"("created_vehicle_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_recipient_id_idx" ON "messages"("sender_id", "recipient_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_read_idx" ON "notifications"("recipient_id", "read");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");

-- CreateIndex
CREATE INDEX "oist_trade_in_requests_email_idx" ON "oist_trade_in_requests"("email");

-- CreateIndex
CREATE INDEX "oist_trade_in_requests_status_idx" ON "oist_trade_in_requests"("status");

-- CreateIndex
CREATE INDEX "photographer_applications_email_idx" ON "photographer_applications"("email");

-- CreateIndex
CREATE INDEX "photographer_applications_status_idx" ON "photographer_applications"("status");

-- CreateIndex
CREATE INDEX "support_tickets_email_idx" ON "support_tickets"("email");

-- CreateIndex
CREATE INDEX "support_tickets_status_priority_idx" ON "support_tickets"("status", "priority");

-- CreateIndex
CREATE INDEX "vehicle_edit_requests_vehicle_id_idx" ON "vehicle_edit_requests"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_edit_requests_requested_by_user_id_idx" ON "vehicle_edit_requests"("requested_by_user_id");

-- CreateIndex
CREATE INDEX "vehicle_edit_requests_status_idx" ON "vehicle_edit_requests"("status");

-- CreateIndex
CREATE INDEX "vehicle_inspection_checklists_managed_sale_request_id_idx" ON "vehicle_inspection_checklists"("managed_sale_request_id");

-- CreateIndex
CREATE INDEX "vehicle_transfers_vehicle_id_idx" ON "vehicle_transfers"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_transfers_buyer_id_idx" ON "vehicle_transfers"("buyer_id");

-- CreateIndex
CREATE INDEX "vehicle_transfers_seller_id_idx" ON "vehicle_transfers"("seller_id");

-- CreateIndex
CREATE INDEX "vehicle_transfers_status_idx" ON "vehicle_transfers"("status");

-- CreateIndex
CREATE INDEX "verification_requests_vehicle_id_idx" ON "verification_requests"("vehicle_id");

-- CreateIndex
CREATE INDEX "verification_requests_user_id_idx" ON "verification_requests"("user_id");

-- CreateIndex
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

-- AddForeignKey
ALTER TABLE "private_seller_slots" ADD CONSTRAINT "private_seller_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_subscriptions" ADD CONSTRAINT "seller_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inapp_notifications" ADD CONSTRAINT "inapp_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_dealership_agreement_id_fkey" FOREIGN KEY ("dealership_agreement_id") REFERENCES "dealership_vehicle_agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealership_vehicle_agreements" ADD CONSTRAINT "dealership_vehicle_agreements_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_purchases" ADD CONSTRAINT "guest_purchases_activated_for_user_id_fkey" FOREIGN KEY ("activated_for_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liaison_agreements" ADD CONSTRAINT "liaison_agreements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "liaison_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liaison_agreements" ADD CONSTRAINT "liaison_agreements_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liaison_applications" ADD CONSTRAINT "liaison_applications_reviewed_by_admin_id_fkey" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managed_sale_requests" ADD CONSTRAINT "managed_sale_requests_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managed_sale_requests" ADD CONSTRAINT "managed_sale_requests_created_vehicle_id_fkey" FOREIGN KEY ("created_vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_managed_sale_request_id_fkey" FOREIGN KEY ("managed_sale_request_id") REFERENCES "managed_sale_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photographer_agreements" ADD CONSTRAINT "photographer_agreements_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photographer_agreements" ADD CONSTRAINT "photographer_agreements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "photographer_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photographer_applications" ADD CONSTRAINT "photographer_applications_reviewed_by_admin_id_fkey" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_edit_requests" ADD CONSTRAINT "vehicle_edit_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_edit_requests" ADD CONSTRAINT "vehicle_edit_requests_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspection_checklists" ADD CONSTRAINT "vehicle_inspection_checklists_managed_sale_request_id_fkey" FOREIGN KEY ("managed_sale_request_id") REFERENCES "managed_sale_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
