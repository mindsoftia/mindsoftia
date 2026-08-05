<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LmsLesson extends Model
{
    use HasFactory;

    protected $fillable = ['course_id', 'title', 'description', 'video_url', 'duration_minutes', 'order', 'is_free_preview'];

    public function course()
    {
        return $this->belongsTo(LmsCourse::class, 'course_id');
    }
}
