namespace Megagram.Data;

using Megagram.Models;
using Microsoft.EntityFrameworkCore;


public class MegaDbContext : DbContext
{
    public DbSet<Convo> convos { get; set; }

    public DbSet<Message> messages { get; set; }
    
    public DbSet<MessageReaction> messageReactions { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<MessageReaction>(entity =>
            {
                entity.HasNoKey();
            });
        }
    
    public MegaDbContext(DbContextOptions<MegaDbContext> options) : base(options)
    {
    }


}