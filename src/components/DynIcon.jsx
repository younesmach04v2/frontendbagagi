import BackpackOutlinedIcon       from '@mui/icons-material/BackpackOutlined'
import LuggageOutlinedIcon        from '@mui/icons-material/LuggageOutlined'
import Inventory2OutlinedIcon     from '@mui/icons-material/Inventory2Outlined'
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined'
import VerifiedUserOutlinedIcon   from '@mui/icons-material/VerifiedUserOutlined'
import LocationOnOutlinedIcon     from '@mui/icons-material/LocationOnOutlined'
import ChatBubbleOutlineIcon      from '@mui/icons-material/ChatBubbleOutlined'
import SyncAltIcon                from '@mui/icons-material/SyncAlt'
import CardGiftcardOutlinedIcon   from '@mui/icons-material/CardGiftcardOutlined'
import EditNoteOutlinedIcon       from '@mui/icons-material/EditNoteOutlined'
import DirectionsCarOutlinedIcon  from '@mui/icons-material/DirectionsCarOutlined'
import CheckCircleOutlineIcon     from '@mui/icons-material/CheckCircleOutlined'

const MAP = {
  backpack: BackpackOutlinedIcon,
  luggage:  LuggageOutlinedIcon,
  box:      Inventory2OutlinedIcon,
  mailbox:  LocalPostOfficeOutlinedIcon,
  shield:   VerifiedUserOutlinedIcon,
  location: LocationOnOutlinedIcon,
  chat:     ChatBubbleOutlineIcon,
  sync:     SyncAltIcon,
  gift:     CardGiftcardOutlinedIcon,
  edit:     EditNoteOutlinedIcon,
  car:      DirectionsCarOutlinedIcon,
  check:    CheckCircleOutlineIcon,
}

export default function DynIcon({ name, style }) {
  const Icon = MAP[name]
  if (!Icon) return null
  return <Icon style={style} />
}


