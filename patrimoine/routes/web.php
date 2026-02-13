<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');
// <?php

// use Illuminate\Support\Facades\Route;
// use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Sites/Index');
});
