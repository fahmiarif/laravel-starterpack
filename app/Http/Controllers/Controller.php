<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

abstract class Controller
{
    /**
     * Return a standardized JSON success response.
     */
    public function jsonSuccess(string $message, mixed $data = null, int $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Return a standardized JSON error response.
     */
    public function jsonError(string $message, mixed $error = null, int $code = 500)
    {
        $this->logError($message, $error);

        // In production (debug = false), we hide the raw technical error from the user
        $technicalError = config('app.debug') ? $error : null;

        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $technicalError,
        ], $code);
    }

    /**
     * Reusable error logging helper.
     */
    protected function logError(string $message, mixed $error = null): void
    {
        Log::channel('daily')->error($message, [
            'error' => $error,
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'input' => request()->except(['password', 'password_confirmation', 'current_password']),
            'user_id' => auth()->id(),
        ]);
    }
}
