import type React from 'react'

export type SwipeAction = "like" | "dislike"
export type VerificationStatus = "unverified" | "pending" | "verified"
export type VerificationType = "student" | "landlord"

export type Listing = {
  id: string; user_id: string; title: string | null; type: string;
  address: string; neighborhood: string | null; lat: number | null; lng: number | null;
  rent: number; deposit: number | null; beds: number; baths: number; sqft: number | null;
  furnished: boolean; pets: boolean; utilities: boolean; photos: string[];
  amenities: string[]; proximity_tags: string[]; description: string | null;
  status: string; is_sublease: boolean; available_from: string | null;
  available_to: string | null; distance_to_campus: string | null;
  created_at: string; updated_at: string;
}

export type Profile = {
  id: string; user_id: string; name: string; avatar: string | null; bio: string | null;
  grad_year: number | null; student_id: string | null; phone: string | null;
  business_name: string | null; license_number: string | null;
  role: "student" | "subletter" | "landlord"; verified: boolean; created_at: string;
  verification_status?: VerificationStatus; verification_type?: VerificationType;
}

export type SavedListing = { id: string; user_id: string; listing_id: string; created_at: string; }

export type Conversation = {
  id: string; listing_id: string | null; participant_one: string; participant_two: string;
  last_message: string | null; last_message_at: string | null; created_at: string;
}

export type Message = {
  id: string; sender_id: string; receiver_id: string; listing_id: string | null;
  conversation_id: string | null;
  body: string; read: boolean; created_at: string;
}

export type Review = {
  id: string; author_id: string; landlord_id: string; listing_id: string | null;
  rating: number; body: string; created_at: string;
}

export type RoommateProfile = {
  id: string; user_id: string; budget_min: number; budget_max: number;
  move_in_date: string; lifestyle: string[]; cleanliness: number;
  bio: string | null; neighborhood: string | null; year: string | null;
  major: string | null; verified: boolean; created_at: string;
}

export type RoommateGroup = {
  id: string; created_by: string; total_size: number; budget_min: number;
  budget_max: number; lifestyle: string[]; description: string | null;
  neighborhood: string | null; move_in_date: string; verified: boolean; created_at: string;
}

export type SubletDetails = {
  id: string; listing_id: string; original_lease_end: string;
  move_out_date: string; reason: string | null; semester: string | null;
}

export type PriceAlert = {
  id: string; user_id: string; listing_id: string;
  target_price: number | null; notified_at: string | null; created_at: string;
}

// Component prop types
export type CardProps = { children: React.ReactNode; className?: string; onClick?: () => void }
export type ButtonProps = { label: string; onClick: () => void; variant: "primary" | "secondary" | "ghost"; disabled?: boolean }
export type IconButtonProps = { icon: React.ReactNode; onClick: () => void; ariaLabel: string }
export type SectionProps = { children: React.ReactNode }
export type SectionItemProps = { children: React.ReactNode; index: number }
export type SkeletonProps = { height: number; width?: number | string }
export type InputProps = { value: string; onChange: (value: string) => void; placeholder?: string }
export type PillProps = { label: string; active: boolean; onClick: () => void }
export type ListingCardProps = { listing: Listing; onClick: (id: string) => void; onSave: (id: string) => void; isSaved: boolean }
export type ListingImageProps = { src: string; alt: string }
export type ListingMetaProps = { beds: number; baths: number; location: string }
export type PriceTagProps = { price: number }
export type SaveButtonProps = { isSaved: boolean; onToggle: () => void }
export type ListingGridProps = { listings: Listing[]; onCardClick: (id: string) => void; onSave: (id: string) => void; savedIds?: Set<string> }
export type SwipeStackProps = { listings: Listing[]; onSwipe: (id: string, action: SwipeAction) => void }
export type SwipeCardProps = { listing: Listing; onSwipe: (action: SwipeAction) => void }
export type SwipeIndicatorsProps = { direction: SwipeAction | null }
export type SwipeActionsProps = { onLike: () => void; onDislike: () => void; onUndo: () => void }
export type UndoToastProps = { visible: boolean; onUndo: () => void }
export type HeroSectionProps = { onSearch: (query: string) => void }
export type SearchBarProps = { value: string; onChange: (value: string) => void; onSubmit: () => void }
export type FilterPillsProps = { filters: string[]; active: string; onChange: (filter: string) => void }
export type StatItemProps = { label: string; value: number }
export type FilterBarProps = { filters: string[]; active: string; onChange: (filter: string) => void }
export type ImageGalleryProps = { images: string[] }
export type PriceBarProps = { price: number; onContact: () => void }
export type RoleSelectorProps = { selected: "student" | "landlord"; onSelect: (role: "student" | "landlord") => void }
export type TabSwitcherProps = { tabs: string[]; active: string; onChange: (tab: string) => void }
export type NeighborhoodCardProps = { name: string; imageUrl: string; onClick: (neighborhood: string) => void }
export type FeatureCardProps = { title: string; description: string; icon: React.ReactNode }
export type MapSectionProps = { lat: number; lng: number; address: string }
