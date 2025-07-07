import usersData from "../data/users.json";

export function authenticateUser(username, password, reduxUsers) {
  // Prefer redux users if provided, fallback to static usersData
  const users = reduxUsers && reduxUsers.length > 0 ? reduxUsers : usersData;
  // Accept both 'username' and 'email' as login field
  return users.find(
    (user) =>
      (user.email === username || user.username === username) &&
      user.password === password
  );
}
