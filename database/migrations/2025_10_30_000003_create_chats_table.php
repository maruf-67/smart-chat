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
     * Creates the chats table for storing chat thread information.
     * Each chat has a unique guest_identifier, optional agent assignment,
     * and tracks auto-reply status and last activity timestamp.
     */
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table): void {
            $table->id();
            $table->string('guest_identifier')->unique()->index();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('auto_reply_enabled')->default(false);
            $table->timestamp('last_activity_at')->nullable();

            // Loggable trait columns
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->ipAddress('created_ip')->nullable();
            $table->ipAddress('updated_ip')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
