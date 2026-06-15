<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $table): void {
            $table->string('verification_status')->default('unverified')->after('status');
            $table->json('verification_documents')->nullable()->after('verification_status');
            $table->string('verification_full_name')->nullable()->after('verification_documents');
            $table->string('verification_photo_path')->nullable()->after('verification_full_name');
            $table->string('verification_cin_path')->nullable()->after('verification_photo_path');
            $table->string('verification_artisan_card_path')->nullable()->after('verification_cin_path');
        });
    }

    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table): void {
            $table->dropColumn([
                'verification_status',
                'verification_documents',
                'verification_full_name',
                'verification_photo_path',
                'verification_cin_path',
                'verification_artisan_card_path',
            ]);
        });
    }
};
