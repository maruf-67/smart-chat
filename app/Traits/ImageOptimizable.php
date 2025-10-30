<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

/**
 * ImageOptimizable Trait
 *
 * Provides utilities for managing optimized image storage and retrieval.
 * Integrates with Laravel's Storage API for secure file handling.
 *
 * @context: User profile images, chat attachments, rule media
 *
 * @pattern: Trait-based image management with Storage facade
 */
trait ImageOptimizable
{
    /**
     * Get the full URL for an image.
     */
    public function getImageUrl(?string $filename, string $folder = 'images'): ?string
    {
        if (is_null($filename)) {
            return null;
        }

        $path = "{$folder}/{$filename}";
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        return null;
    }

    /**
     * Delete an image file from storage.
     */
    public function deleteImageFile(?string $filename, string $folder = 'images'): bool
    {
        if (is_null($filename)) {
            return false;
        }

        $path = "{$folder}/{$filename}";
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }

    /**
     * Store an uploaded image file.
     */
    public function storeImageFile(\Illuminate\Http\UploadedFile $file, string $folder = 'images'): ?string
    {
        if (! $file || ! $file->isValid()) {
            return null;
        }

        $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');

        return $path ? $filename : null;
    }
}
