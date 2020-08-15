export default function ({ store, route, redirect }) {
  const user = store.state.user
  if (!user && route.path === '/') {
    return redirect('/login')
  }
}