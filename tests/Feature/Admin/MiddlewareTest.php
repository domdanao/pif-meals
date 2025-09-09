<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AdminOnlyMiddleware;
use App\Http\Middleware\StaffMiddleware;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

beforeEach(function () {
    // Create roles first
    $adminRole = Role::firstOrCreate(['name' => Role::ADMIN], ['display_name' => 'Admin', 'description' => 'Admin users']);
    $staffRole = Role::firstOrCreate(['name' => Role::STAFF], ['display_name' => 'Staff', 'description' => 'Staff users']);
    $studentRole = Role::firstOrCreate(['name' => Role::STUDENT], ['display_name' => 'Student', 'description' => 'Student users']);
    $donorRole = Role::firstOrCreate(['name' => Role::DONOR], ['display_name' => 'Donor', 'description' => 'Donor users']);

    // Create users and assign roles
    $this->adminUser = User::factory()->create(['role' => 'admin']);
    $this->adminUser->roles()->attach($adminRole->id);

    $this->staffUser = User::factory()->create(['role' => 'staff']);
    $this->staffUser->roles()->attach($staffRole->id);

    $this->studentUser = User::factory()->create(['role' => 'student']);
    $this->studentUser->roles()->attach($studentRole->id);

    $this->donorUser = User::factory()->create(['role' => 'donor']);
    $this->donorUser->roles()->attach($donorRole->id);
});

describe('AdminMiddleware', function () {
    it('allows admin users', function () {
        $this->actingAs($this->adminUser);

        $request = Request::create('/admin/dashboard');
        $middleware = new AdminMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getContent())->toBe('Success');
    });

    it('allows staff users', function () {
        $this->actingAs($this->staffUser);

        $request = Request::create('/admin/vouchers');
        $middleware = new AdminMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getContent())->toBe('Success');
    });

    it('denies student users', function () {
        $this->actingAs($this->studentUser);

        $request = Request::create('/admin/dashboard');
        $middleware = new AdminMiddleware;

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Access denied. Admin or staff privileges required.');

        $middleware->handle($request, function () {
            return response('Success');
        });
    });

    it('denies donor users', function () {
        $this->actingAs($this->donorUser);

        $request = Request::create('/admin/dashboard');
        $middleware = new AdminMiddleware;

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Access denied. Admin or staff privileges required.');

        $middleware->handle($request, function () {
            return response('Success');
        });
    });

    it('redirects unauthenticated users to login', function () {
        $request = Request::create('/admin/dashboard');
        $middleware = new AdminMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getStatusCode())->toBe(302);
        expect($response->headers->get('Location'))->toContain('/login');
    });
});

describe('AdminOnlyMiddleware', function () {
    it('allows admin users', function () {
        $this->actingAs($this->adminUser);

        $request = Request::create('/admin/users');
        $middleware = new AdminOnlyMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getContent())->toBe('Success');
    });

    it('denies staff users', function () {
        $this->actingAs($this->staffUser);

        $request = Request::create('/admin/users');
        $middleware = new AdminOnlyMiddleware;

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Access denied. Admin privileges required.');

        $middleware->handle($request, function () {
            return response('Success');
        });
    });

    it('denies student users', function () {
        $this->actingAs($this->studentUser);

        $request = Request::create('/admin/users');
        $middleware = new AdminOnlyMiddleware;

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Access denied. Admin privileges required.');

        $middleware->handle($request, function () {
            return response('Success');
        });
    });

    it('redirects unauthenticated users to login', function () {
        $request = Request::create('/admin/users');
        $middleware = new AdminOnlyMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getStatusCode())->toBe(302);
        expect($response->headers->get('Location'))->toContain('/login');
    });
});

describe('StaffMiddleware', function () {
    it('allows admin users', function () {
        $this->actingAs($this->adminUser);

        $request = Request::create('/admin/vouchers');
        $middleware = new StaffMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getContent())->toBe('Success');
    });

    it('allows staff users', function () {
        $this->actingAs($this->staffUser);

        $request = Request::create('/admin/vouchers');
        $middleware = new StaffMiddleware;

        $response = $middleware->handle($request, function () {
            return response('Success');
        });

        expect($response->getContent())->toBe('Success');
    });

    it('denies student users', function () {
        $this->actingAs($this->studentUser);

        $request = Request::create('/admin/vouchers');
        $middleware = new StaffMiddleware;

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Access denied. Staff privileges required.');

        $middleware->handle($request, function () {
            return response('Success');
        });
    });
});
