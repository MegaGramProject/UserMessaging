using System.ComponentModel.DataAnnotations;


namespace Megagram.Models.RequestBodies;

public class AddMessage
{
    [Key]
    public Guid messageId {get; set; }
    public string convoId { get; set; }
    public string message { get; set; }
    public string sender { get; set; }
    public DateTime messageSentAt { get; set; }
    public string sessionKeyId { get; set; }

}