<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KbArticle extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'title', 'slug', 'content', 'is_published', 'views', 'helpful_votes'];

    public function category()
    {
        return $this->belongsTo(KbCategory::class, 'category_id');
    }
}
