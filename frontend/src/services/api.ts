const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cursos_gt_token');
  }

  async request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth = false, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders as Record<string, string>,
    };

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro de rede' }));
      throw new Error(error.message || `Erro ${response.status}`);
    }

    // Para DELETE que retorna 204
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  }

  async register(data: { name: string; email: string; password: string; phone?: string; cpf?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Courses
  async getCourses(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/courses${query}`);
  }

  async getPublishedCourses() {
    return this.request('/courses?status=PUBLISHED', { skipAuth: true });
  }

  async getCourse(slug: string) {
    return this.request(`/courses/${slug}`, { skipAuth: true });
  }

  async createCourse(data: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: number, data: any) {
    return this.request(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: number) {
    return this.request(`/courses/${id}`, { method: 'DELETE' });
  }

  // Classes
  async getClasses(courseId?: number) {
    const query = courseId ? `?courseId=${courseId}` : '';
    return this.request(`/classes${query}`);
  }

  async getClass(id: number) {
    return this.request(`/classes/${id}`);
  }

  async createClass(data: any) {
    return this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClass(id: number, data: any) {
    return this.request(`/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClass(id: number) {
    return this.request(`/classes/${id}`, { method: 'DELETE' });
  }

  // Lessons
  async getLessons(courseId?: number) {
    const query = courseId ? `?courseId=${courseId}` : '';
    return this.request(`/lessons${query}`);
  }

  async getLesson(id: number) {
    return this.request(`/lessons/${id}`);
  }

  async getLessonsByCourse(courseId: number) {
    return this.request(`/lessons/course/${courseId}`);
  }

  async createLesson(data: any) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLesson(id: number, data: any) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLesson(id: number) {
    return this.request(`/lessons/${id}`, { method: 'DELETE' });
  }

  async reorderLessons(courseId: number, lessonIds: number[]) {
    return this.request(`/lessons/course/${courseId}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ lessonIds }),
    });
  }

  // Enrollments
  async getEnrollments(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/enrollments${query}`);
  }

  async getMyEnrollments() {
    return this.request('/enrollments/my');
  }

  async createEnrollment(data: { userId: number; classId: number }) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEnrollmentStatus(id: number, status: string) {
    return this.request(`/enrollments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  // Attendance
  async checkInAttendance(lessonId: number, presenceToken: string) {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ lessonId, presenceToken }),
    });
  }

  async getMyAttendances() {
    return this.request('/attendance/my');
  }
}

export const api = new ApiService();

