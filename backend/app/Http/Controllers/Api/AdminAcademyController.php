<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LmsCourse;
use App\Models\LmsLesson;
use App\Models\KbArticle;
use App\Models\LmsCategory;
use App\Models\KbCategory;
use Illuminate\Support\Str;

class AdminAcademyController extends Controller
{
    // ==========================================
    // COURSES
    // ==========================================
    public function getCourses()
    {
        $courses = LmsCourse::with('category')->withCount('lessons')->get();
        $categories = LmsCategory::all();
        return response()->json(['success' => true, 'data' => ['courses' => $courses, 'categories' => $categories]]);
    }

    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:lms_categories,id',
            'description' => 'required|string',
            'level' => 'required|string',
            'thumbnail_url' => 'nullable|url'
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        $validated['is_published'] = $request->boolean('is_published', true);

        $course = LmsCourse::create($validated);
        return response()->json(['success' => true, 'message' => 'Curso creado', 'data' => $course]);
    }

    public function updateCourse(Request $request, $id)
    {
        $course = LmsCourse::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:lms_categories,id',
            'description' => 'required|string',
            'level' => 'required|string',
            'thumbnail_url' => 'nullable|url'
        ]);

        if ($request->title !== $course->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        }
        $validated['is_published'] = $request->boolean('is_published', $course->is_published);

        $course->update($validated);
        return response()->json(['success' => true, 'message' => 'Curso actualizado', 'data' => $course]);
    }

    public function deleteCourse($id)
    {
        $course = LmsCourse::findOrFail($id);
        $course->delete();
        return response()->json(['success' => true, 'message' => 'Curso eliminado']);
    }

    // ==========================================
    // LESSONS
    // ==========================================
    public function getLessons($courseId)
    {
        $lessons = LmsLesson::where('course_id', $courseId)->orderBy('order')->get();
        return response()->json(['success' => true, 'data' => $lessons]);
    }

    public function storeLesson(Request $request, $courseId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'required|url',
            'duration_minutes' => 'required|integer',
            'description' => 'nullable|string',
            'order' => 'required|integer',
            'is_free_preview' => 'boolean'
        ]);

        $validated['course_id'] = $courseId;
        $lesson = LmsLesson::create($validated);
        return response()->json(['success' => true, 'message' => 'Lección creada', 'data' => $lesson]);
    }

    public function updateLesson(Request $request, $courseId, $lessonId)
    {
        $lesson = LmsLesson::where('course_id', $courseId)->findOrFail($lessonId);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'required|url',
            'duration_minutes' => 'required|integer',
            'description' => 'nullable|string',
            'order' => 'required|integer',
            'is_free_preview' => 'boolean'
        ]);

        $lesson->update($validated);
        return response()->json(['success' => true, 'message' => 'Lección actualizada', 'data' => $lesson]);
    }

    public function deleteLesson($courseId, $lessonId)
    {
        $lesson = LmsLesson::where('course_id', $courseId)->findOrFail($lessonId);
        $lesson->delete();
        return response()->json(['success' => true, 'message' => 'Lección eliminada']);
    }

    // ==========================================
    // ARTICLES (KNOWLEDGE BASE)
    // ==========================================
    public function getArticles()
    {
        $articles = KbArticle::with('category')->get();
        $categories = KbCategory::all();
        return response()->json(['success' => true, 'data' => ['articles' => $articles, 'categories' => $categories]]);
    }

    public function storeArticle(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:kb_categories,id',
            'content' => 'required|string'
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        $validated['is_published'] = $request->boolean('is_published', true);

        $article = KbArticle::create($validated);
        return response()->json(['success' => true, 'message' => 'Artículo creado', 'data' => $article]);
    }

    public function updateArticle(Request $request, $id)
    {
        $article = KbArticle::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:kb_categories,id',
            'content' => 'required|string'
        ]);

        if ($request->title !== $article->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        }
        $validated['is_published'] = $request->boolean('is_published', $article->is_published);

        $article->update($validated);
        return response()->json(['success' => true, 'message' => 'Artículo actualizado', 'data' => $article]);
    }

    public function deleteArticle($id)
    {
        $article = KbArticle::findOrFail($id);
        $article->delete();
        return response()->json(['success' => true, 'message' => 'Artículo eliminado']);
    }
}
