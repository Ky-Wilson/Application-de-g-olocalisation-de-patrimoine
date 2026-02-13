<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    protected $fillable = [
        'nom',
        'description',
        'type',
        'type_autre',
        'latitude',
        'longitude',
        'ville',
        'date_creation',
        'photo_url'
    ];
}
