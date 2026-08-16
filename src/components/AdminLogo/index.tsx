import { FullLogo } from '@root/graphics/FullLogo/index'

const AdminLogo = () => (
  <div
    aria-label="Ecolitea"
    role="img"
    style={{
      color: 'var(--theme-elevation-1000)',
      width: 'min(250px, 70vw)',
    }}
  >
    <FullLogo style={{ display: 'block', height: 'auto', width: '100%' }} />
  </div>
)

export default AdminLogo
