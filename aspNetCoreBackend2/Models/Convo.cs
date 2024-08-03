using System.ComponentModel.DataAnnotations;


namespace Megagram.Models;

public class Convo
{
    [Key]
    public Guid convoId {get; set; }
    public string convoTitle { get; set; }
    public string latestMessageId { get; set; }
    public bool isRequested { get; set; }
    public string promotedUsers { get; set; }
    public string members { get; set; }
    public string convoInitiator { get; set; }
}
