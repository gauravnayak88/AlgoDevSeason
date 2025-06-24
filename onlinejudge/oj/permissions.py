from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """
    Custom permission to only allow staff users to modify their own objects.
    """

    def has_permission(self, request, view):
        # Used for list/create views
        return request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'staff'

    def has_object_permission(self, request, view, obj):
        # Used for retrieve/update/delete views
        return request.user == obj.written_by