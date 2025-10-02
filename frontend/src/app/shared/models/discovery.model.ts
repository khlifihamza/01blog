import { DiscoveryPost } from "./post.model";
import { DiscoveryUser } from "./user.model";

export interface DiscoveryResponse{
    discoveryUsers: DiscoveryUser[];
    discoveryPosts: DiscoveryPost[];
}