<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LmsCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'icon'];

    public function courses()
    {
        return $this->hasMany(LmsCourse::class, 'category_id');
    }
}
