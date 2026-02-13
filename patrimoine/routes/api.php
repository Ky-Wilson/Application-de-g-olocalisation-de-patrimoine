<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SiteController;

Route::prefix('v1')->group(function () {
    Route::get('sites/nearby', [SiteController::class, 'nearby']);
    Route::apiResource('sites', SiteController::class);
});
