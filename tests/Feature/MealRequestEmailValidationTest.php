<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns user data when email exists for a student', function () {
    // Create roles first
    $studentRole = Role::create([
        'name' => Role::STUDENT,
        'display_name' => 'Student',
        'description' => 'Students who can request meals',
    ]);

    // Create a student user
    $student = User::factory()->create([
        'email' => 'john@up.edu.ph',
        'name' => 'John Doe',
        'phone' => '09123456789',
        'role' => 'student',
        'course' => 'BS Computer Science',
        'year_level' => '3rd Year',
        'student_id' => '2021-12345',
    ]);

    // Assign student role using new system
    $student->roles()->attach($studentRole->id);

    $response = $this->postJson('/students/check-email', [
        'email' => 'john@up.edu.ph',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => true,
            'user' => [
                'name' => 'John Doe',
                'phone' => '09123456789',
                'course' => 'BS Computer Science',
                'year_level' => '3rd Year',
                'student_id' => '2021-12345',
            ],
        ]);
});

it('returns false when email does not exist', function () {
    $response = $this->postJson('/students/check-email', [
        'email' => 'nonexistent@up.edu.ph',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => false,
        ]);
});

it('does not return non-student users', function () {
    // Create roles first
    $adminRole = Role::create([
        'name' => Role::ADMIN,
        'display_name' => 'Admin',
        'description' => 'Administrators with full system access',
    ]);

    // Create a non-student user
    $admin = User::factory()->create([
        'email' => 'admin@up.edu.ph',
        'role' => 'admin',
    ]);

    // Assign admin role using new system
    $admin->roles()->attach($adminRole->id);

    $response = $this->postJson('/students/check-email', [
        'email' => 'admin@up.edu.ph',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => false,
        ]);
});

it('validates email format', function () {
    $response = $this->postJson('/students/check-email', [
        'email' => 'invalid-email',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('requires email field', function () {
    $response = $this->postJson('/students/check-email', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('debug - creates and checks the specific email dom@danao.co', function () {
    // Create student role first
    $studentRole = Role::create([
        'name' => Role::STUDENT,
        'display_name' => 'Student',
        'description' => 'Students who can request meals',
    ]);

    // Create a user with the specific email
    $createdUser = User::factory()->create([
        'email' => 'dom@danao.co',
        'name' => 'Dominick Danao',
        'role' => 'student',
        'phone' => '09123456789',
        'course' => 'Computer Science',
        'year_level' => '4th Year',
        'student_id' => '2021-99999',
    ]);

    // Assign student role using new system
    $createdUser->roles()->attach($studentRole->id);

    // Verify user was created
    expect($createdUser->email)->toBe('dom@danao.co');
    expect($createdUser->role)->toBe('student');
    expect($createdUser->hasRole(Role::STUDENT))->toBeTrue();

    // Test the API
    $response = $this->postJson('/students/check-email', [
        'email' => 'dom@danao.co',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => true,
            'user' => [
                'name' => 'Dominick Danao',
                'phone' => '09123456789',
                'course' => 'Computer Science',
                'year_level' => '4th Year',
                'student_id' => '2021-99999',
            ],
        ]);
});

it('demonstrates donor can become student - email validation shows new student but user exists', function () {
    // Create roles
    $donorRole = Role::create([
        'name' => Role::DONOR,
        'display_name' => 'Donor',
        'description' => 'Users who make donations',
    ]);

    // Create a donor user (like dom@danao.co)
    $donor = User::factory()->create([
        'email' => 'donor@example.com',
        'name' => 'Test Donor',
        'role' => 'donor',
    ]);

    // Assign donor role
    $donor->roles()->attach($donorRole->id);

    // Verify they are a donor, not a student
    expect($donor->hasRole(Role::DONOR))->toBeTrue();
    expect($donor->hasRole(Role::STUDENT))->toBeFalse();

    // Email validation should return false (no student role)
    $response = $this->postJson('/students/check-email', [
        'email' => 'donor@example.com',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => false, // Correct! No student record exists
        ]);

    // But the user does exist in the database
    expect(User::where('email', 'donor@example.com')->exists())->toBeTrue();

    // This demonstrates the correct behavior:
    // - Email validation says "New student detected" (correct)
    // - When they submit the form, the system will add student role to existing donor
});

it('returns existing document information for returning students', function () {
    // Create student role and document
    $studentRole = Role::create([
        'name' => Role::STUDENT,
        'display_name' => 'Student',
        'description' => 'Students who can request meals',
    ]);

    $student = User::factory()->create([
        'email' => 'returning@student.com',
        'name' => 'Returning Student',
        'role' => 'student',
        'phone' => '09123456789',
        'course' => 'Computer Science',
        'year_level' => '3rd Year',
        'student_id' => '2021-54321',
    ]);

    $student->roles()->attach($studentRole->id);

    // Create an existing document for this student
    $document = \App\Models\StudentDocument::create([
        'student_id' => $student->id,
        'file_url' => '/storage/student-documents/test-document.pdf',
        'file_type' => 'pdf',
        'file_size' => 1024000, // 1MB
        'original_filename' => 'enrollment-proof.pdf',
    ]);

    $response = $this->postJson('/students/check-email', [
        'email' => 'returning@student.com',
    ]);

    $response->assertOk()
        ->assertJson([
            'exists' => true,
            'user' => [
                'name' => 'Returning Student',
                'phone' => '09123456789',
                'course' => 'Computer Science',
                'year_level' => '3rd Year',
                'student_id' => '2021-54321',
                'existing_document' => [
                    'file_url' => '/storage/student-documents/test-document.pdf',
                    'original_filename' => 'enrollment-proof.pdf',
                    'file_type' => 'pdf',
                    'file_size' => '1000 KB',
                ],
            ],
        ])
        ->assertJsonStructure([
            'user' => [
                'existing_document' => [
                    'uploaded_at',
                ],
            ],
        ]);
});
