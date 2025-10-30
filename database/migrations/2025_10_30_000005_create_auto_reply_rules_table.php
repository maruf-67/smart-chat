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
     * Creates the auto_reply_rules table for storing automated response rules.
     * Each rule contains a keyword trigger and corresponding reply message.
     * Rules can be linked to specific chats or be global system-wide rules.
     */
    public function up(): void
    {
        Schema::create('auto_reply_rules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('chat_id')->nullable()->constrained('chats')->cascadeOnDelete();
            $table->string('keyword')->unique();
            $table->text('reply_message');
            $table->boolean('is_active')->default(true);

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
        Schema::dropIfExists('auto_reply_rules');
    }
};
