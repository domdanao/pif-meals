<?php

namespace App\Http\Controllers;

use App\Models\SystemMetric;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        $metrics = SystemMetric::getPublicMetrics();

        return Inertia::render('welcome', [
            'metrics' => $metrics,
        ]);
    }
}
