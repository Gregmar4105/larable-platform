<?php

use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ServerController;
use App\Http\Controllers\ServerPingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/control-center');
    Route::inertia('control-center', 'control-center')->name('dashboard');
    Route::resource('servers', ServerController::class);
    Route::post('api/servers/ping', [ServerPingController::class, 'ping'])->name('servers.ping');

    Route::post('organizations/{organization}/switch', [OrganizationController::class, 'switch'])->name('organizations.switch');
    Route::resource('organizations', OrganizationController::class);
});

require __DIR__.'/settings.php';
