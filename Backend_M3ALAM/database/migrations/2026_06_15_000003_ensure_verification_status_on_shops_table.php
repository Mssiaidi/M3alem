<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('shops', 'verification_status')) {
            Schema::table('shops', function (Blueprint $table): void {
                $table->string('verification_status')->default('unverified')->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('shops', 'verification_status')) {
            Schema::table('shops', function (Blueprint $table): void {
                $table->dropColumn('verification_status');
            });
        }
    }
};
