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
        // === KNOWLEDGE BASE ===
        Schema::create('kb_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('kb_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('kb_categories')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content'); // HTML or Markdown
            $table->boolean('is_published')->default(true);
            $table->integer('views')->default(0);
            $table->integer('helpful_votes')->default(0);
            $table->timestamps();
        });

        // === LMS ACADEMY ===
        Schema::create('lms_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('lms_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('lms_categories')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('thumbnail_url')->nullable();
            $table->string('level')->default('Básico'); // Básico, Intermedio, Avanzado
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('lms_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('lms_courses')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url'); // URL to Vimeo or YouTube
            $table->integer('duration_minutes')->default(0);
            $table->integer('order')->default(1);
            $table->boolean('is_free_preview')->default(false);
            $table->timestamps();
        });

        // user_course_progress (Omitimos foreign_key real a `users` si es API pura, pero asumimos auth estandar)
        Schema::create('lms_progress', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Referencia al user
            $table->foreignId('lesson_id')->constrained('lms_lessons')->onDelete('cascade');
            $table->boolean('completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'lesson_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lms_progress');
        Schema::dropIfExists('lms_lessons');
        Schema::dropIfExists('lms_courses');
        Schema::dropIfExists('lms_categories');
        Schema::dropIfExists('kb_articles');
        Schema::dropIfExists('kb_categories');
    }
};
