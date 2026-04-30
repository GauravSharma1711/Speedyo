import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. Authenticate the user making the request
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get the post ID and reaction type from the request body
        const { postId, reactionType } = await req.json();
        if (!postId) {
            return Response.json({ error: 'Missing postId' }, { status: 400 });
        }
        
        // 3. Fetch the current post using elevated privileges
        const post = await base44.asServiceRole.entities.Post.get(postId);
        if (!post) {
            return Response.json({ error: 'Post not found' }, { status: 404 });
        }

        // 4. Calculate the new reaction state
        const updatedReactions = { ...(post.reactions || {}) };
        const updatedUserReactions = [...(post.user_reactions || [])];

        const existingReactionIndex = updatedUserReactions.findIndex(
            (ur) => ur.user_email === user.email
        );

        // If the user has an existing reaction, remove it first
        if (existingReactionIndex > -1) {
            const oldReaction = updatedUserReactions[existingReactionIndex].reaction;
            updatedReactions[oldReaction] = Math.max(0, (updatedReactions[oldReaction] || 0) - 1);
            updatedUserReactions.splice(existingReactionIndex, 1);
        }

        // If a new reaction type is provided (and it's different), add it
        if (reactionType) {
            updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
            updatedUserReactions.push({
                user_email: user.email,
                reaction: reactionType
            });
        }
        
        // 5. Update the post with the new reaction data using elevated privileges
        const updatedPost = await base44.asServiceRole.entities.Post.update(postId, {
            reactions: updatedReactions,
            user_reactions: updatedUserReactions
        });

        // 6. Return the successfully updated post data
        return Response.json(updatedPost);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});