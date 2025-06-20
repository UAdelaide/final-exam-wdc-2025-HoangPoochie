// public/login.js
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = {
    username: form.username.value.trim(),
    password: form.password.value
  };

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (res.ok) {
      // On success, redirect to the protected dashboard
      window.location.href = '/dashboard';
    } else {
      // Show error message
      document.getElementById('error').textContent = result.error;
    }
  } catch (err) {
    console.error(err);
    document.getElementById('error').textContent = 'Network error';
  }
});
