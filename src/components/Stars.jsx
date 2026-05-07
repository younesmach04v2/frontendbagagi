export default function Stars({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  let stars = '★'.repeat(full)
  if (half) stars += '½'
  return (
    <>
      <span className="stars">{stars}</span>{' '}
      <span style={{ color: 'var(--mid-grey)', fontSize: '0.85rem' }}>{rating}</span>
    </>
  )
}
