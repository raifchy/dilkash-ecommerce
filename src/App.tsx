import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from './lib/supabase'
import './App.css'

type Category = 'Punjabis' | 'Polos' | 'T-Shirts' | 'Shirts'
type Product = { id: number; name: string; category: Category; price: number; image: string; description: string }
type OrderLine = { name: string; price: number; quantity: number }
type Order = { id: string; date: string; customer: string; phone: string; address: string; items: OrderLine[]; status: string }

const sampleProducts: Product[] = [
  { id: 1, name: 'Signature Pique Polo', category: 'Polos', price: 1450, description: 'A refined cotton polo with a clean, comfortable fit.', image: 'https://images.unsplash.com/photo-1625910513413-5fc45b4e8d6d?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'Heritage Cotton Panjabi', category: 'Punjabis', price: 2350, description: 'Breathable cotton and understated details for every occasion.', image: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'Noir Essential Polo', category: 'Polos', price: 1250, description: 'An everyday essential in deep noir premium cotton.', image: 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'Ivory Textured Panjabi', category: 'Punjabis', price: 2750, description: 'A textured ivory weave with a modern, elegant silhouette.', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Everyday Heavyweight T-Shirt', category: 'T-Shirts', price: 950, description: 'A structured heavyweight tee designed for everyday comfort.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85' },
  { id: 6, name: 'Coastal Oxford Shirt', category: 'Shirts', price: 1850, description: 'A versatile Oxford shirt with a relaxed, polished finish.', image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85' },
]
const money = (value: number) => `৳${value.toLocaleString('en-BD')}`
const getCart = (): Product[] => JSON.parse(localStorage.getItem('dilkash-cart') || '[]')
const getOrders = (): Order[] => JSON.parse(localStorage.getItem('dilkash-orders') || '[]')
const announcements = ['Cash on delivery · Delivery charge confirmed by phone', '7-day doorstep exchange on unworn items', 'Premium menswear, made for Bangladesh']
const ADMIN_EMAIL = 'dilkashofficialbd@gmail.com'

const isCategory = (value: string): value is Category => ['Punjabis', 'Polos', 'T-Shirts', 'Shirts'].includes(value)

async function loadProducts(): Promise<Product[]> {
  if (!supabase) return sampleProducts
  try {
    const { data, error } = await supabase.from('products').select('id, name, category, price, description, image_url').order('id')
    if (error || !data?.length) return sampleProducts
    const loaded = data
      .filter((row) => Number.isFinite(Number(row.id)) && isCategory(row.category))
      .map((row) => ({
        id: Number(row.id),
        name: row.name,
        category: row.category,
        price: Number(row.price),
        description: row.description || '',
        image: row.image_url || sampleProducts[0].image,
      }))
    return loaded.length ? loaded : sampleProducts
  } catch {
    return sampleProducts
  }
}

function Layout({ cartCount }: { cartCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [message, setMessage] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setMessage((current) => (current + 1) % announcements.length), 4500); return () => window.clearInterval(timer) }, [])
  return <><div className="announcement">CHITTAGONG STUDIO · 01769 512 082 <span>{announcements[message]}</span></div><header className="header"><div className="mobile-left"><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu"><span /><span /><span /></button><Link className="search-toggle" to="/products" aria-label="Search products"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.2" /><path d="m16 16 5 5" /></svg></Link></div><Link className="brand" to="/">DILKASH<span>.</span></Link><nav className={`nav ${menuOpen ? 'open' : ''}`}><Link onClick={() => setMenuOpen(false)} to="/products">All Products</Link><Link onClick={() => setMenuOpen(false)} to="/products?category=Panjabis">Punjabis</Link><Link onClick={() => setMenuOpen(false)} to="/products?category=Polos">Polos</Link><Link onClick={() => setMenuOpen(false)} to="/products?category=T-Shirts">T-Shirts</Link><Link onClick={() => setMenuOpen(false)} to="/products?category=Shirts">Shirts</Link><Link onClick={() => setMenuOpen(false)} to="/#story">Our story</Link></nav><div className="header-actions"><Link className="account-link" to="/login" aria-label="Account"><svg className="account-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 21c.5-4 3-6 7.5-6s7 2 7.5 6" /></svg><span>Account</span></Link><Link className="cart-link" to="/cart" aria-label={`Cart with ${cartCount} items`}><svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg><span className="cart-label">Cart</span><b>{cartCount}</b></Link></div></header></>
}

function Home({ products }: { products: Product[] }) {
  const heroProduct = products[1] || products[0] || sampleProducts[1]
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow">Luxury menswear · Chittagong</p><h1>Where heritage meets<br /><em>your elegance.</em></h1><p className="hero-text">Contemporary essentials crafted for discerning sophistication and everyday confidence.</p><Link className="primary-button" to="/shop">Shop collection <span>↗</span></Link></div><div className="hero-art"><div className="gold-disc" /><img src={heroProduct.image} alt="Dilkash heritage menswear" /><p className="hero-caption">SS / 26<br />CHITTAGONG</p></div></section><section className="service-strip"><div><strong>Nationwide delivery</strong><span>Across Bangladesh</span></div><div><strong>Doorstep exchange</strong><span>7-day size replacement</span></div><div><strong>Premium fabrics</strong><span>Considered details</span></div><div><strong>Cash on delivery</strong><span>Confirm by phone</span></div></section><section className="home-section" id="story"><p className="eyebrow">The DILKASH standard</p><h2>Quiet confidence.<br /><em>Always.</em></h2><p>We believe the best clothes do not need to announce themselves. DILKASH is a study in quality, fit, and the details that make a lasting impression.</p><Link className="text-link" to="/shop">Discover the collection →</Link></section></>
}

function Shop({ products }: { products: Product[] }) {
  const [params] = useSearchParams()
  const selected = params.get('category') as Category | null
  const [category, setCategory] = useState<'All Products' | Category>(selected || 'All Products')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [wishlist, setWishlist] = useState<number[]>([])
  const list = products.filter((p) => (category === 'All Products' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : a.id - b.id)
  const categories = ['All Products', 'Punjabis', 'Polos', 'T-Shirts', 'Shirts'] as const
  return <section className="page-section products-page"><div className="catalog-intro"><div><p className="eyebrow">The complete collection</p><h2>Find your essentials.</h2><p>Premium menswear, rooted in Chittagong.</p></div><div className="catalog-tools"><label className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" /></label><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div></div><div className="catalog-bar"><div className="filters">{categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><span>{list.length} products</span></div><div className="product-grid">{list.map((product) => <ProductCard product={product} key={product.id} wished={wishlist.includes(product.id)} onWish={() => setWishlist(wishlist.includes(product.id) ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id])} />)}</div>{list.length === 0 && <div className="empty-catalog">No products match your search.</div>}</section>
}

function ProductCard({ product, wished, onWish }: { product: Product; wished: boolean; onWish: () => void }) {
  return <article className="product-card"><div className="product-image"><Link to={`/product/${product.id}`}><img src={product.image} alt={product.name} /></Link><button className={`wishlist ${wished ? 'wished' : ''}`} onClick={onWish} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>{wished ? '♥' : '♡'}</button><Link to={`/product/${product.id}`} className="quick-add">View product <b>→</b></Link></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{money(product.price)}</strong></div></article>
}

function ProductPage({ products, loading, addToCart }: { products: Product[]; loading: boolean; addToCart: (p: Product) => void }) {
  const { id } = useParams()
  const product = products.find((p) => p.id === Number(id))
  if (!product && loading) return <section className="center-page"><p>Loading product…</p></section>
  if (!product) return <Navigate to="/shop" />
  return <section className="detail-page"><img src={product.image} alt={product.name} /><div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong className="detail-price">{money(product.price)}</strong><p className="detail-description">{product.description}</p><p className="delivery-note">Cash on delivery available. Delivery charge will be confirmed by phone.</p><button className="primary-button" onClick={() => addToCart(product)}>Add to cart <span>+</span></button></div></section>
}

function Cart({ cart, setCart }: { cart: Product[]; setCart: (items: Product[]) => void }) {
  const navigate = useNavigate()
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
  return <section className="page-section cart-page"><p className="eyebrow">Your selections</p><h2>Shopping cart.</h2>{cart.length === 0 ? <div className="empty-cart"><p>Your cart is empty.</p><Link className="primary-button" to="/shop">Continue shopping <span>→</span></Link></div> : <><div className="cart-list">{cart.map((item, index) => <div className="cart-row" key={`${item.id}-${index}`}><img src={item.image} alt="" /><div><h3>{item.name}</h3><p>{item.category}</p></div><strong>{money(item.price)}</strong><button onClick={() => setCart(cart.filter((_, i) => i !== index))}>Remove</button></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>{money(subtotal)}</strong><small>Delivery charge confirmed by phone.</small><button className="primary-button" onClick={() => navigate('/checkout')}>Proceed to checkout <span>→</span></button></div></>}</section>
}

function localOrder(data: FormData, cart: Product[]): Order {
  return { id: `DK-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleDateString('en-GB'), customer: String(data.get('name')), phone: String(data.get('phone')), address: String(data.get('address')), items: cart.map((item) => ({ name: item.name, price: item.price, quantity: 1 })), status: 'New order' }
}

function Checkout({ cart, clearCart }: { cart: Product[]; clearCart: () => void }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (!cart.length) return <Navigate to="/cart" />
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const data = new FormData(event.currentTarget)
    try {
      if (!supabase) {
        const order = localOrder(data, cart)
        localStorage.setItem('dilkash-orders', JSON.stringify([order, ...getOrders()]))
        clearCart()
        navigate(`/confirmation/${order.id}`)
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      const total = cart.reduce((sum, item) => sum + item.price, 0)
      const { data: orderId, error: orderError } = await supabase.rpc('create_cod_order', {
        p_user_id: userData.user?.id || null,
        p_customer_name: String(data.get('name')),
        p_phone: String(data.get('phone')),
        p_address: String(data.get('address')),
        p_total: total,
        p_items: cart.map((item) => ({ product_id: item.id, product_name: item.name, price: item.price, quantity: 1 })),
      })
      if (orderError || !orderId) throw orderError || new Error('The order could not be created.')
      clearCart()
      navigate(`/confirmation/${orderId}`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not place your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  return <section className="checkout-page"><div><p className="eyebrow">Cash on delivery</p><h2>Complete your order.</h2><p className="modal-intro">We will call you at 01769 512 082 to confirm your order and delivery charge.</p><form onSubmit={submit}><label>Full name<input required name="name" placeholder="Your name" /></label><label>Phone number<input required name="phone" type="tel" placeholder="01XXXXXXXXX" /></label><label>Delivery address<textarea required name="address" placeholder="House, road, area, district" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={submitting}>{submitting ? 'Placing order…' : 'Place COD order'} <span>→</span></button></form></div><aside><p className="eyebrow">Order summary</p>{cart.map((item, i) => <p className="summary-line" key={`${item.id}-${i}`}><span>{item.name}</span><strong>{money(item.price)}</strong></p>)}<hr /><p className="summary-line"><span>Total</span><strong>{money(cart.reduce((s, p) => s + p.price, 0))}</strong></p></aside></section>
}

function Confirmation() {
  const { id } = useParams()
  return <section className="center-page"><p className="eyebrow">Thank you</p><h2>Order received.</h2><p>Your order <strong>{id}</strong> is saved. We will contact you at the phone number you provided to confirm your order and delivery charge.</p><Link className="primary-button" to="/orders">View my orders <span>→</span></Link></section>
}

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!supabase) {
      setError('Authentication is unavailable. Check the Supabase environment configuration.')
      return
    }
    setSubmitting(true)
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email'))
    const password = String(data.get('password'))
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
    setSubmitting(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (mode === 'signup' && !result.data.session) {
      setSuccess('Account created. Check your email to confirm your account, then sign in.')
      return
    }
    navigate('/orders')
  }
  return <section className="auth-page"><p className="eyebrow">DILKASH account</p><h2>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h2><p>{mode === 'signin' ? 'Sign in to view your orders and account details.' : 'Create an account to keep your orders together.'}</p><form onSubmit={submit}><label>Email address<input required name="email" type="email" placeholder="you@example.com" /></label><label>Password<input required name="password" type="password" minLength={6} placeholder="Your password" /></label>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}<button className="primary-button" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'} <span>→</span></button></form><button className="text-link auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}>{mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button></section>
}

type RemoteOrder = { id: string; created_at: string; customer_name: string; phone: string; address: string; status: string; order_items: { product_name: string; price: number; quantity: number }[] | null }

function Orders() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders())
  const [loading, setLoading] = useState(Boolean(supabase))
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    const load = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        if (active) {
          setLoading(false)
          setMessage('Sign in to view orders saved to your account.')
        }
        return
      }
      const { data, error } = await supabase.from('orders').select('id, created_at, customer_name, phone, address, status, order_items(product_name, price, quantity)').eq('user_id', userData.user.id).order('created_at', { ascending: false })
      if (!active) return
      if (error) {
        setMessage('Your account orders are unavailable right now. Showing orders saved on this device.')
      } else {
        const remoteOrders = (data || []) as unknown as RemoteOrder[]
        setOrders(remoteOrders.map((order) => ({ id: order.id, date: new Date(order.created_at).toLocaleDateString('en-GB'), customer: order.customer_name, phone: order.phone, address: order.address, status: order.status, items: (order.order_items || []).map((item) => ({ name: item.product_name, price: item.price, quantity: item.quantity })) })))
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])
  return <section className="page-section orders-page"><p className="eyebrow">Account</p><h2>My orders.</h2>{loading ? <p>Loading your orders…</p> : message && <p className="account-message">{message}</p>}{!loading && orders.length === 0 ? <div className="empty-cart"><p>No orders yet.</p><Link className="primary-button" to="/shop">Start shopping <span>→</span></Link></div> : orders.map((order) => <article className="order-card" key={order.id}><div><strong>{order.id}</strong><span>{order.date}</span></div><p>{order.items.map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`).join(', ')}</p><span className="order-status">{order.status}</span><small>Delivery: {order.address}<br />Phone: {order.phone}</small></article>)}</section>
}

function Admin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    const load = async () => {
      if (!supabase) { setLoading(false); setMessage('Admin access requires Supabase configuration.'); return }
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user || userData.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        if (active) { setAuthorized(false); setLoading(false); setMessage('Sign in with the authorized DILKASH admin email to continue.') }
        return
      }
      setAuthorized(true)
      const { data, error } = await supabase.from('orders').select('id, created_at, customer_name, phone, address, status, order_items(product_name, price, quantity)').order('created_at', { ascending: false })
      if (!active) return
      if (error) setMessage(`Unable to load orders: ${error.message}`)
      else {
        const remoteOrders = (data || []) as unknown as RemoteOrder[]
        setOrders(remoteOrders.map((order) => ({ id: order.id, date: new Date(order.created_at).toLocaleDateString('en-GB'), customer: order.customer_name, phone: order.phone, address: order.address, status: order.status, items: (order.order_items || []).map((item) => ({ name: item.product_name, price: item.price, quantity: item.quantity })) })))
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])
  const update = async (id: string, status: string) => {
    if (!supabase) return
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { setMessage(`Unable to update order: ${error.message}`); return }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
  }
  if (loading) return <section className="page-section orders-page"><p>Checking admin access…</p></section>
  if (!authorized) return <section className="page-section orders-page"><p className="eyebrow">DILKASH management</p><h2>Admin access.</h2><p className="account-message">{message}</p><Link className="primary-button" to="/login">Sign in <span>→</span></Link></section>
  return <section className="page-section orders-page"><p className="eyebrow">DILKASH management</p><h2>Order dashboard.</h2><p className="admin-note">Orders placed by customers appear here for phone confirmation.</p>{message && <p className="account-message">{message}</p>}{orders.length === 0 ? <p>No customer orders yet.</p> : orders.map((order) => <article className="order-card" key={order.id}><div><strong>{order.id}</strong><span>{order.date}</span></div><p><b>{order.customer}</b> · {order.phone}<br />{order.items.map((item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`).join(', ')}</p><small>{order.address}</small><select value={order.status} onChange={(e) => void update(order.id, e.target.value)}><option>New order</option><option>Confirmed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></article>)}</section>
}

function App() {
  const [cart, setCartState] = useState<Product[]>(getCart)
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [productsLoading, setProductsLoading] = useState(Boolean(supabase))
  const setCart = (items: Product[]) => { setCartState(items); localStorage.setItem('dilkash-cart', JSON.stringify(items)) }
  useEffect(() => {
    let active = true
    void loadProducts().then((loaded) => { if (active) { setProducts(loaded); setProductsLoading(false) } })
    return () => { active = false }
  }, [])
  return <BrowserRouter><Layout cartCount={cart.length} /><main><Routes><Route path="/" element={<Home products={products} />} /><Route path="/products" element={<Shop products={products} />} /><Route path="/shop" element={<Navigate to="/products" replace />} /><Route path="/product/:id" element={<ProductPage products={products} loading={productsLoading} addToCart={(p) => setCart([...cart, p])} />} /><Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} /><Route path="/checkout" element={<Checkout cart={cart} clearCart={() => setCart([])} />} /><Route path="/confirmation/:id" element={<Confirmation />} /><Route path="/login" element={<Login />} /><Route path="/orders" element={<Orders />} /><Route path="/admin/orders" element={<Admin />} /><Route path="*" element={<Navigate to="/" />} /></Routes></main><footer><div className="footer-brand">DILKASH<span>.</span><p>Premium menswear from Chittagong.</p></div><div><p className="footer-label">Customer care</p><a href="tel:01769512082">01769 512 082</a><Link to="/orders">My orders</Link></div><div><p className="footer-label">Management</p><Link to="/admin/orders">Admin orders</Link></div><p className="copyright">© 2026 DILKASH</p></footer></BrowserRouter>
}

export default App
