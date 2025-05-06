package edu.cit.campuscart.dto;

public class ConversationDTO {
    private String otherUsername;
    private Integer productCode;
    private String productName;
    private String productImage;
    private String lastMessage;
    private int unreadCount;

    // Getters and setters
    public String getOtherUsername() { return otherUsername; }
    public void setOtherUsername(String otherUsername) { this.otherUsername = otherUsername; }
    public Integer getProductCode() { return productCode; }
    public void setProductCode(Integer productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
} 