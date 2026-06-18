<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';

    protected $fillable = [
        'nombre',
        'subdominio',
        'ruc_nit',
        'email',
        'telefono',
        'is_active',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
