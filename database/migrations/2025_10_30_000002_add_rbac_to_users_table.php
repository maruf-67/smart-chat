<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Enhances the users table with RBAC fields following lara-api-starter structure.
     * This migration runs AFTER the roles table is created to avoid FK constraints.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the 'name' column from Fortify (we compute it from first_name + last_name)
            $table->dropColumn('name');

            // Add profile information (first_name, last_name instead of name)
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('image')->nullable();
            $table->string('phone')->after('image')->nullable();
            $table->timestamp('phone_verified_at')->after('phone')->nullable();

            // OTP fields for phone verification
            $table->string('otp')->after('phone_verified_at')->nullable();
            $table->timestamp('otp_expires_at')->after('otp')->nullable();

            // Status flag
            $table->boolean('status')->after('otp_expires_at')->default(true);

            // Add RBAC fields
            $table->enum('user_type', ['admin', 'agent', 'guest'])->after('status')->default('agent');
            $table->foreignId('role_id')->after('user_type')->nullable()->constrained('roles')->onDelete('set null');

            // Add audit columns for tracking user changes
            $table->unsignedBigInteger('created_by')->after('role_id')->nullable();
            $table->unsignedBigInteger('updated_by')->after('created_by')->nullable();
            $table->ipAddress('created_ip')->after('updated_by')->nullable();
            $table->ipAddress('updated_ip')->after('created_ip')->nullable();

            // Add indexes for performance
            $table->index('user_type');
            $table->index('role_id');
            $table->index('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign keys from users table
            $table->dropForeign(['role_id']);

            // Drop indexes
            $table->dropIndex(['user_type']);
            $table->dropIndex(['role_id']);
            $table->dropIndex(['phone']);

            // Drop columns
            $table->dropColumn([
                'first_name',
                'last_name',
                'image',
                'phone',
                'phone_verified_at',
                'otp',
                'otp_expires_at',
                'status',
                'user_type',
                'role_id',
                'created_by',
                'updated_by',
                'created_ip',
                'updated_ip',
            ]);

            // Restore the original 'name' column from Fortify
            $table->string('name')->nullable();
        });
    }
};
