<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LmsCourse extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'title', 'slug', 'description', 'thumbnail_url', 'level', 'is_published'];

    public function category()
    {
        return $this->belongsTo(LmsCategory::class, 'category_id');
    }

    public function lessons()
    {
        return $this->hasMany(LmsLesson::class, 'course_id')->orderBy('order');
    }
}
