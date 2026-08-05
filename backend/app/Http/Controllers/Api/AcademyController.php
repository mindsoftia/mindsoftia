<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LmsCourse;
use App\Models\KbArticle;

class AcademyController extends Controller
{
    public function getCourses()
    {
        $courses = LmsCourse::with('category', 'lessons')
            ->where('is_published', true)
            ->get()
            ->map(function($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'level' => $course->level,
                    'category' => $course->category ? $course->category->name : 'General',
                    'thumbnail' => $course->thumbnail_url ?? 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600',
                    'lessons_count' => $course->lessons->count(),
                    'duration' => $course->lessons->sum('duration_minutes') . 'm', // Simplificado
                    'progress' => rand(0, 30) // Dato dummy simulado por ahora
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    }

    public function getCourseDetails($id)
    {
        $course = LmsCourse::with(['category', 'lessons' => function($q) {
            $q->orderBy('order');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'lessons' => $course->lessons->map(function($l) {
                    return [
                        'id' => $l->id,
                        'title' => $l->title,
                        'duration' => $l->duration_minutes . ':00',
                        'completed' => false
                    ];
                })
            ]
        ]);
    }

    public function getArticles()
    {
        $articles = KbArticle::with('category')
            ->where('is_published', true)
            ->get()
            ->map(function($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'category' => $a->category ? $a->category->name : 'General',
                    'views' => $a->views,
                    'helpful' => $a->helpful_votes,
                    'date' => $a->created_at->diffForHumans()
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }
}
