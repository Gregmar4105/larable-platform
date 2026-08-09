<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type')->default('web');
            $table->string('provider')->default('aws');
            $table->string('ip_address');
            $table->string('ipv6_address')->nullable();
            $table->string('host_address')->nullable();
            $table->string('region');
            $table->string('location_pin')->nullable();
            $table->string('status')->default('online');
            $table->integer('cpu_usage')->default(15);
            $table->float('ram_used_gb')->default(4.0);
            $table->float('ram_total_gb')->default(8.0);
            $table->float('ram_percent')->default(50.0);
            $table->float('disk_used_gb')->default(45.0);
            $table->float('disk_total_gb')->default(160.0);
            $table->float('disk_percent')->default(28.1);
            $table->string('uptime')->default('100%');
            $table->json('tags')->nullable();
            $table->string('php_version')->nullable();
            $table->string('db_engine')->nullable();
            $table->integer('active_sites_count')->nullable();
            $table->integer('proxmox_port')->nullable();
            $table->string('proxmox_token_id')->nullable();
            $table->integer('vcpus')->default(4);
            $table->integer('ram_gb')->default(8);
            $table->integer('disk_gb')->default(160);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
