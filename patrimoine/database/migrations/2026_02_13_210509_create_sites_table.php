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
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description');
            $table->enum('type', [
                'monument',
                'musee',
                'site_naturel',
                'batiment_historique',
                'eglise',
                'cathedrale',
                'mosquee',
                'temple',
                'chateau',
                'palais',
                'fort',
                'statue',
                'fontaine',
                'pont',
                'place',
                'parc',
                'jardin',
                'site_archeologique',
                'grotte',
                'cascade',
                'plage',
                'theatre',
                'opera',
                'bibliotheque',
                'marche',
                'commemoratif',
                'autre'
            ]);
            $table->string('type_autre')->nullable(); 
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('ville');
            $table->year('date_creation');
            $table->string('photo_url')->nullable();
            $table->timestamps();

            // Index pour améliorer les performances des recherches géospatiales
            $table->index(['latitude', 'longitude']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};
