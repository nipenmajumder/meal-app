# Permission-Based Menu System Documentation

## Overview

The meal management application now includes a comprehensive permission-based menu system that controls what navigation items and features users can access based on their roles and permissions.

## Roles & Permissions

### Default Roles

1. **Admin**
   - Full access to all features
   - Can manage users, roles, and permissions
   - Has all permissions automatically

2. **Meal Manager**
   - Can manage meals, deposits, shopping expenses
   - Can view most data but cannot manage users or roles
   - Has most permissions except user/role management

3. **Member**
   - Can only view data
   - Cannot create, edit, or delete records
   - Has only "view" permissions

### Key Permissions

- `view dashboard` - Access to dashboard
- `view meals` - Access to meals section
- `view deposits` - Access to deposits section
- `view shopping expenses` - Access to shopping section
- `view users` - Access to user management
- `view roles` - Access to role management
- `create meals` - Can add new meals
- `edit meals` - Can modify meals
- `delete meals` - Can remove meals
- And many more...

## Frontend Implementation

### Sidebar Navigation

The sidebar now dynamically shows/hides menu items based on user permissions:

```tsx
// Example: Users menu only shows if user has 'view users' permission
{
  title: 'Users',
  href: '/users',
  icon: Users,
  permission: 'view users',
}
```

### Permission Checking Components

#### 1. Can Component
```tsx
import { Can } from '@/components/Can';

<Can permission="create meals">
  <Button>Add New Meal</Button>
</Can>
```

#### 2. usePermissions Hook
```tsx
import { usePermissions } from '@/hooks/usePermissions';

const { hasPermission, hasRole, isAuthenticated } = usePermissions();

if (hasPermission('edit meals')) {
  // Show edit button
}
```

#### 3. PermissionButton Component
```tsx
import { PermissionButton } from '@/components/PermissionComponents';

<PermissionButton permission="delete meals" variant="destructive">
  Delete Meal
</PermissionButton>
```

## Backend Implementation

### Route Protection

Routes are protected using Laravel's built-in `can` middleware:

```php
// Only users with 'view users' permission can access user routes
Route::middleware('can:view users')->group(function () {
    Route::resource('users', UserController::class);
});
```

### Automatic Permission Loading

User permissions and roles are automatically loaded with each request via the `HandleInertiaRequests` middleware:

```php
'auth' => [
    'user' => $request->user() ? [
        ...$request->user()->toArray(),
        'permissions' => $request->user()->getAllPermissions()->map(...),
        'roles' => $request->user()->roles->map(...),
    ] : null,
],
```

## Setup Instructions

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Seed Roles and Permissions
```bash
php artisan db:seed --class=RolePermissionSeeder
```

### 3. Create Admin User
```bash
php artisan db:seed --class=AdminUserSeeder
```

### 4. Login as Admin
- Email: admin@meal-app.com
- Password: password123

### 5. Assign Roles to Users
Use the admin account to assign appropriate roles to other users through the Users management interface.

## Adding New Permissions

### 1. Update the RolePermissionSeeder
Add new permissions to the `$permissions` array:

```php
$permissions = [
    // ... existing permissions
    'manage reports',
    'export data',
    // ... new permissions
];
```

### 2. Update Navigation Config
Add permission requirements to navigation items:

```tsx
{
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    permission: 'manage reports',
}
```

### 3. Protect Routes
Add middleware to routes:

```php
Route::get('reports', ReportController::class)
    ->middleware('can:manage reports');
```

### 4. Re-seed
```bash
php artisan db:seed --class=RolePermissionSeeder
```

## Best Practices

1. **Always check permissions on both frontend and backend**
2. **Use descriptive permission names** (e.g., 'create meals' not 'create')
3. **Group related permissions** (e.g., all meal-related permissions together)
4. **Test with different user roles** to ensure proper access control
5. **Use the Can component** for conditional rendering
6. **Protect all sensitive routes** with appropriate middleware

## Troubleshooting

### Menu Items Not Showing
- Check if user has the required permission
- Verify permission name spelling in navigation config
- Ensure roles are properly assigned to the user

### Access Denied Errors
- Check route middleware configuration
- Verify user has the required permission
- Check if permission exists in the database

### Permission Not Working
- Clear application cache: `php artisan cache:clear`
- Re-seed permissions: `php artisan db:seed --class=RolePermissionSeeder`
- Check user role assignments in the database
